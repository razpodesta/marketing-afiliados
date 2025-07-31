// Ruta: lib/actions/workspaces.actions.ts
/**
 * @file workspaces.actions.ts
 * @description Contiene las Server Actions para la gestión de workspaces. Ha sido
 *              refactorizado para presentar contratos de API agnósticos al cliente,
 *              mejorando la cohesión y la consistencia arquitectónica del sistema.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Client-Agnostic API Contracts)
 */

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  CreateWorkspaceSchema,
  InvitationSchema,
} from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function setActiveWorkspaceAction
 * @description Establece el workspace activo para el usuario en una cookie segura y
 *              desencadena una revalidación del layout para actualizar el contexto de la aplicación.
 * @param {string} workspaceId - El identificador único universal del workspace a activar.
 * @returns {Promise<void>} Una promesa que resuelve cuando la redirección es iniciada.
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
 * @async
 * @function createWorkspaceAction
 * @description Crea un nuevo workspace y asigna al usuario como propietario de forma atómica.
 *              Su signatura agnóstica (`(formData)`) permite ser consumida por cualquier patrón de formulario.
 * @param {FormData} formData - Los datos del formulario que deben cumplir con `CreateWorkspaceSchema`.
 * @returns {Promise<ActionResult<{ id: string }>>} El resultado de la operación, conteniendo el ID del nuevo workspace en caso de éxito.
 */
export async function createWorkspaceAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado. Inicia sesión de nuevo." };
  }

  const validation = CreateWorkspaceSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    const errorMessage =
      validation.error.flatten().fieldErrors.workspaceName?.[0] ||
      "Datos inválidos.";
    return { success: false, error: errorMessage };
  }

  const { workspaceName, icon } = validation.data;

  const { error, data: newWorkspace } = await supabase
    .rpc("create_workspace_with_owner", {
      owner_user_id: user.id,
      new_workspace_name: workspaceName,
      new_workspace_icon: icon,
    })
    .select("id")
    .single();

  if (error || !newWorkspace) {
    logger.error("[WorkspacesActions] Error en RPC al crear workspace:", error);
    return { success: false, error: "No se pudo crear el workspace." };
  }

  await createAuditLog("workspace_created", {
    userId: user.id,
    targetEntityId: newWorkspace.id,
    targetEntityType: "workspace",
    metadata: { workspaceName, icon },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true, data: { id: newWorkspace.id } };
}

/**
 * @async
 * @function sendWorkspaceInvitationAction
 * @description Crea y envía una invitación a un nuevo miembro, validando
 *              que el usuario emisor tenga los permisos de administrador necesarios.
 * @param {FormData} formData - Los datos del formulario que deben cumplir con `InvitationSchema`.
 * @returns {Promise<ActionResult<{ message: string }>>} El resultado de la operación.
 */
export async function sendWorkspaceInvitationAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado." };
  }

  const validation = InvitationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validation.success) {
    return { success: false, error: "Datos de invitación inválidos." };
  }

  const { email: inviteeEmail, role, workspaceId } = validation.data;

  if (inviteeEmail === user.email) {
    return { success: false, error: "No puedes invitarte a ti mismo." };
  }

  const permissionCheck = await requireWorkspacePermission(workspaceId, [
    "owner",
    "admin",
  ]);

  if (!permissionCheck.success) {
    return { success: false, error: permissionCheck.error };
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
      // Clave única violada
      return {
        success: false,
        error: "Este usuario ya ha sido invitado o ya es miembro.",
      };
    }
    logger.error(
      "[WorkspacesActions] Error al crear invitación:",
      invitationError
    );
    return { success: false, error: "No se pudo enviar la invitación." };
  }

  await createAuditLog("workspace_invitation_sent", {
    userId: user.id,
    targetEntityId: workspaceId,
    targetEntityType: "workspace",
    metadata: { invitedEmail: inviteeEmail, role },
  });

  revalidateTag(`invitations:${inviteeEmail}`);
  return {
    success: true,
    data: { message: `Invitación enviada a ${inviteeEmail}.` },
  };
}

/**
 * @async
 * @function acceptInvitationAction
 * @description Permite al usuario autenticado aceptar una invitación a un workspace.
 *              Invoca una función RPC segura para garantizar la integridad de los datos.
 * @param {string} invitationId - El ID del convite a ser aceptado.
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
    logger.error(
      "[WorkspacesActions] Error en RPC al aceptar invitación:",
      error
    );
    return { success: false, error: "No se pudo aceptar la invitación." };
  }

  if (data && !data.success) {
    return { success: false, error: data.error };
  }

  await createAuditLog("workspace_invitation_accepted", {
    userId: user.id,
    targetEntityId: invitationId,
    targetEntityType: "invitation",
  });

  revalidateTag(`workspaces:${user.id}`);
  revalidateTag(`invitations:${user.email}`);
  revalidatePath("/dashboard", "layout");

  return {
    success: true,
    data: { message: data.message || "Te has unido al workspace con éxito!" },
  };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la capa de acciones de workspaces.
 *
 * 1.  **Notificación por Email al Invitar:** La mejora más crítica para `sendWorkspaceInvitationAction` es integrar el `EmailService` para enviar una notificación por correo electrónico al usuario invitado, incluyendo un enlace directo para aceptar la invitación.
 * 2.  **Transacciones de Base de Datos:** Para operaciones que involucran múltiples escrituras (ej. `acceptInvitationAction` que crea un miembro y actualiza una invitación), envolverlas en una función RPC de PostgreSQL para garantizar la atomicidad. Si una parte falla, todo se revierte.
 * 3.  **Acción para Revocar Invitaciones:** Implementar una nueva Server Action `revokeInvitationAction(invitationId)` que permita a los administradores del workspace eliminar invitaciones pendientes. Esta acción debe incluir una verificación de permisos y registrar un log de auditoría.
 */

/**
 * @fileoverview El aparato `workspaces.actions.ts` es el guardián de la lógica de negocio para la colaboración.
 * @functionality
 * - **Gestión de Contexto:** Proporciona `setActiveWorkspaceAction` para cambiar el contexto de trabajo del usuario.
 * - **Ciclo de Vida del Workspace:** Incluye `createWorkspaceAction` para el onboarding y la creación de nuevos entornos de trabajo.
 * - **Gestión de Membresía:** Orquesta el flujo completo de invitaciones con `sendWorkspaceInvitationAction` y `acceptInvitationAction`, aplicando rigurosas comprobaciones de permisos en cada paso.
 * @relationships
 * - Es consumido por múltiples componentes de cliente, incluyendo `CreateWorkspaceForm`, `InviteMemberForm`, y `WorkspaceSwitcher`.
 * - Depende críticamente del Guardián de Permisos (`lib/auth/user-permissions.ts`) para la lógica de autorización.
 * - Utiliza el manifiesto de validadores (`lib/validators/index.ts`) para asegurar la integridad de los datos de entrada.
 * - Depende del helper de auditoría (`lib/actions/_helpers/audit-log.helper.ts`) para la trazabilidad de la seguridad.
 * @expectations
 * - Se espera que este aparato sea una barrera de seguridad robusta para todas las mutaciones relacionadas con workspaces. Sus contratos de API deben ser agnósticos al cliente, y su lógica debe ser atómica y proporcionar un feedback claro a través del tipo `ActionResult`.
 */
