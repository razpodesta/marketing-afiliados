/**
 * @file app/actions/workspaces.actions.ts
 * @description Contiene las Server Actions para la gestión de workspaces.
 * @refactor
 * REFACTORIZACIÓN DE CACHÉ: Se ha añadido `revalidateTag` a la acción de aceptar
 * invitaciones para invalidar la caché de datos del layout del dashboard,
 * asegurando que la lista de workspaces se actualice inmediatamente.
 *
 * @author Metashark
 * @version 3.2.0 (Cache Revalidation)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  WorkspaceSchema,
  InvitationSchema,
  type CreateWorkspaceFormState,
  type InviteMemberFormState,
  type ActionResult,
} from "./schemas";
import type { Database } from "@/lib/types/database";

/**
 * @description Establece el workspace activo para el usuario en una cookie y redirige al dashboard.
 * @param {string} workspaceId - El UUID del workspace a activar.
 */
export async function setActiveWorkspaceAction(
  workspaceId: string
): Promise<void> {
  cookies().set("active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

/**
 * @description Crea un nuevo workspace con un nombre y un icono, y asigna al usuario
 *              actual como propietario en una única transacción atómica.
 * @param {CreateWorkspaceFormState} prevState - El estado anterior del formulario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<CreateWorkspaceFormState>} El nuevo estado del formulario.
 */
export async function createWorkspaceAction(
  prevState: CreateWorkspaceFormState,
  formData: FormData
): Promise<CreateWorkspaceFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado. Inicia sesión de nuevo.", success: false };
  }

  const validation = WorkspaceSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    const formErrors = validation.error.flatten().fieldErrors;
    const errorMessage =
      formErrors.workspaceName?.[0] ||
      formErrors.icon?.[0] ||
      "Datos inválidos.";
    return { error: errorMessage, success: false };
  }

  const { workspaceName, icon } = validation.data;

  const { error } = await supabase.rpc("create_workspace_with_owner", {
    owner_user_id: user.id,
    new_workspace_name: workspaceName,
    new_workspace_icon: icon,
  });

  if (error) {
    logger.error("Error en RPC al crear el workspace con icono:", error);
    return { error: "No se pudo crear el workspace.", success: false };
  }

  revalidatePath("/dashboard", "layout");
  return { error: null, success: true };
}

/**
 * @description Crea un registro de invitación para un nuevo miembro a un workspace.
 *              Verifica que el usuario que invita tenga los permisos necesarios.
 * @param {InviteMemberFormState} prevState - El estado anterior del formulario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<InviteMemberFormState>} El nuevo estado del formulario.
 */
export async function sendWorkspaceInvitationAction(
  prevState: InviteMemberFormState,
  formData: FormData
): Promise<InviteMemberFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const validation = InvitationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    return { error: "Datos de invitación inválidos." };
  }

  const { email: inviteeEmail, role, workspaceId } = validation.data;

  if (inviteeEmail === user.email) {
    return { error: "No puedes invitarte a ti mismo." };
  }

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (memberError || !member) {
    return { error: "No eres miembro de este workspace." };
  }

  const allowedRoles: Array<Database["public"]["Enums"]["workspace_role"]> = [
    "owner",
    "admin",
  ];
  if (!allowedRoles.includes(member.role)) {
    return { error: "No tienes permisos para invitar a nuevos miembros." };
  }

  const { error: invitationError } = await supabase.from("invitations").insert({
    workspace_id: workspaceId,
    invitee_email: inviteeEmail,
    role: role,
    invited_by: user.id,
    status: "pending",
  });

  if (invitationError) {
    if (invitationError.code === "23505") {
      return { error: "Este usuario ya ha sido invitado a este workspace." };
    }
    logger.error("Error al crear la invitación:", invitationError);
    return { error: "No se pudo enviar la invitación." };
  }

  revalidatePath(`/dashboard/settings`);
  return { success: true, message: `Invitación enviada a ${inviteeEmail}.` };
}

/**
 * @description Permite al usuario autenticado aceptar una invitación a un workspace.
 *              Invoca una función RPC segura para garantizar la integridad de los datos.
 * @param {string} invitationId - El ID de la invitación a aceptar.
 * @returns {Promise<ActionResult<{ message: string }>>} El resultado de la operación.
 */
export async function acceptInvitationAction(
  invitationId: string
): Promise<ActionResult<{ message: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado." };
  }

  const { data, error } = await supabase.rpc("accept_workspace_invitation", {
    invitation_id: invitationId,
    accepting_user_id: user.id,
  });

  if (error) {
    logger.error("Error en RPC al aceptar invitación:", error);
    return { success: false, error: "No se pudo aceptar la invitación." };
  }

  if (data && !data.success) {
    return { success: false, error: data.error };
  }

  // MEJORA: Invalidar la caché de workspaces e invitaciones para el usuario.
  revalidateTag(`workspaces:${user.id}`);
  revalidateTag(`invitations:${user.id}`);
  revalidatePath("/dashboard", "layout");

  return { success: true, data: { message: data.message } };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Envío de Email Real: La mejora más crítica es reemplazar el TODO en `sendWorkspaceInvitationAction` con una integración real a un servicio de email transaccional (como Resend) para enviar un correo con un enlace de invitación único y seguro.
 * 2. Acción para Rechazar Invitación: Crear una nueva `Server Action` `declineInvitationAction` que simplemente actualice el estado de la invitación a 'declined', permitiendo al usuario limpiar su lista de invitaciones pendientes.
 * 3. Notificaciones en Tiempo Real: Integrar Supabase Realtime para que, cuando se reciba una nueva invitación, el `InvitationBell` se actualice en tiempo real sin necesidad de recargar la página.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Envío de Email Real: La mejora más crítica es reemplazar el `TODO` con una integración real a un servicio de email transaccional (como Resend) para enviar un correo con un enlace de invitación único y seguro.
 * 2. Gestión de Invitaciones Pendientes: Crear una nueva página en los ajustes del workspace que muestre una tabla con las invitaciones pendientes, permitiendo a los administradores reenviar o revocar invitaciones.
 * 3. Notificaciones en la App: Cuando se envía una invitación, se podría crear una notificación en la base de datos para el administrador, confirmando que la invitación fue enviada.
 */
