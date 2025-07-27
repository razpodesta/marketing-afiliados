/* Ruta: app/actions.ts */

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { type CampaignConfig } from "@/lib/builder/types.d";
import { getSiteDataBySubdomain } from "@/lib/data/sites";
import type { Database, Json } from "@/lib/database.types";
import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * @file app/actions.ts
 * @description Centro neurálgico de la lógica de negocio del lado del servidor.
 * VALIDACIÓN DE TIPOS: Con el archivo `database.types.ts` actualizado, el
 * error de tipo en `createWorkspaceAction` se ha resuelto. Este aparato
 * ahora es completamente seguro en tipos y está alineado con el esquema
 * real de la base de datos.
 *
 * @author Metashark
 * @version 9.4.0 (Schema Type Validation)
 */

// --- TIPOS Y ESQUEMAS ---

export type ActionResult<T = null> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: T };

export type CreateSiteFormState = {
  subdomain?: string;
  icon?: string;
  error?: string;
  success?: boolean;
};

export type CreateWorkspaceFormState = {
  error: string | null;
  success: boolean;
};

export type RequestPasswordResetState = {
  error?: string;
};

const SiteSchema = z.object({
  subdomain: z
    .string()
    .min(3, "El subdominio debe tener al menos 3 caracteres.")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo se permiten letras minúsculas, números y guiones."
    ),
  icon: z.string().min(1, "El ícono es requerido."),
});

const EmailSchema = z.string().email("Por favor, introduce un email válido.");

// --- FUNCIONES AUXILIARES DE PERMISOS ---

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { user, profile };
}

async function verifyUserRole(
  requiredRoles: Array<Database["public"]["Enums"]["app_role"]>
): Promise<
  | {
      user: User;
      profile: { app_role: Database["public"]["Enums"]["app_role"] };
    }
  | { error: string }
> {
  const authData = await getAuthenticatedUser();
  if (!authData)
    return { error: "Acción no autorizada. Sesión no encontrada." };

  if (!requiredRoles.includes(authData.profile.app_role)) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: Usuario ${authData.user.id} con rol '${
        authData.profile.app_role
      }' intentó una acción restringida a '${requiredRoles.join(", ")}'.`
    );
    return { error: "Permiso denegado." };
  }

  return authData;
}

// --- ACCIONES DE AUTENTICACIÓN Y SESIÓN ---

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/");
}

export async function setActiveWorkspaceAction(workspaceId: string) {
  cookies().set("active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  prevState: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const email = formData.get("email");
  const validation = EmailSchema.safeParse(email);

  if (!validation.success) {
    return { error: "Por favor, introduce un email válido." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_ROOT_URL}/api/auth/callback/confirm`,
  });

  if (error) {
    logger.error("Error al solicitar reseteo de contraseña:", error);
    return {
      error:
        "No se pudo iniciar el proceso de reseteo. Inténtelo de nuevo más tarde.",
    };
  }

  redirect("/auth-notice?message=check-email-for-reset");
}

// --- ACCIONES DE GESTIÓN DE WORKSPACES ---

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

  const workspaceName = formData.get("workspaceName") as string;
  const validation = z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .safeParse(workspaceName);

  if (!validation.success) {
    return { error: validation.error.flatten().formErrors[0], success: false };
  }

  const { data: newWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: validation.data, owner_id: user.id })
    .select()
    .single();

  if (workspaceError || !newWorkspace) {
    logger.error("Error al crear el workspace:", workspaceError);
    return { error: "No se pudo crear el workspace.", success: false };
  }

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: newWorkspace.id,
      user_id: user.id,
      role: "owner", // Este valor ahora es válido gracias a los tipos actualizados.
    });

  if (memberError) {
    logger.error("Error al añadir miembro al workspace:", memberError);
    return { error: "Error de configuración de permisos.", success: false };
  }

  revalidatePath("/dashboard", "layout");
  return { error: null, success: true };
}

// --- ACCIONES DE GESTIÓN DE SITIOS (SITES) ---

export async function createSiteAction(
  prevState: CreateSiteFormState,
  formData: FormData
): Promise<CreateSiteFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const workspaceId = cookies().get("active_workspace_id")?.value;
  if (!workspaceId)
    return { error: "No hay un workspace activo seleccionado." };

  const validation = SiteSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validation.success) {
    return {
      error:
        validation.error.flatten().fieldErrors.subdomain?.[0] ||
        "Datos inválidos.",
    };
  }

  const { subdomain, icon } = validation.data;
  const existingSite = await getSiteDataBySubdomain(subdomain);
  if (existingSite) {
    return { error: "Este subdominio ya está en uso." };
  }

  const { error } = await supabase
    .from("sites")
    .insert({ subdomain, icon, workspace_id: workspaceId });

  if (error) {
    logger.error("Error al crear el sitio:", error);
    return { error: "No se pudo crear el sitio. Inténtalo de nuevo." };
  }

  revalidatePath("/dashboard/sites");
  return { success: true };
}

export async function deleteSiteAsAdminAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const roleCheck = await verifyUserRole(["admin", "developer"]);
  if ("error" in roleCheck) return { success: false, error: roleCheck.error };

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { success: false, error: "Falta el subdominio." };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain);

  if (error) {
    logger.error(`Error al eliminar el sitio ${subdomain}:`, error);
    return { success: false, error: "No se pudo eliminar el sitio." };
  }

  revalidateTag(`sites:${subdomain}`);
  revalidatePath("/admin");
  return {
    success: true,
    data: { message: `Sitio ${subdomain} eliminado correctamente.` },
  };
}

// --- ACCIONES DEL CONSTRUCTOR DE CAMPAÑAS ---

export async function updateCampaignContentAction(
  campaignId: string,
  content: CampaignConfig
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { error } = await supabase
    .from("campaigns")
    .update({
      content: content as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (error) {
    logger.error(`Error al guardar campaña ${campaignId}:`, error);
    return { success: false, error: "No se pudo guardar la campaña." };
  }

  revalidatePath(`/builder/${campaignId}`);
  return { success: true, data: null };
}

// --- ACCIONES DE GESTIÓN DE ROLES (DEV) ---

export async function updateUserRoleAction(
  userId: string,
  newRole: Database["public"]["Enums"]["app_role"]
): Promise<ActionResult> {
  const roleCheck = await verifyUserRole(["developer"]);
  if ("error" in roleCheck) return { success: false, error: roleCheck.error };

  if (roleCheck.user.id === userId) {
    return { success: false, error: "No puedes cambiar tu propio rol." };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ app_role: newRole })
    .eq("id", userId);

  if (error) {
    logger.error(`Error al actualizar rol para ${userId}:`, error);
    return { success: false, error: "No se pudo actualizar el rol." };
  }

  revalidatePath("/dev-console/users");
  return { success: true, data: null };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Crear Tabla de Suscriptores: Para restaurar la funcionalidad del boletín, el primer paso es crear la tabla `subscribers` a través de una nueva migración de Supabase. Una vez que la tabla exista y los tipos se regeneren, la `Server Action` `subscribeToNewsletterAction` podrá ser reintroducida de forma segura.
 * 2. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones. Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar la atomicidad (o todo tiene éxito, o todo falla).
 * 3. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica para registrar quién hizo qué, a qué y cuándo, lo cual es indispensable para la seguridad y el soporte.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Crear Tabla de Suscriptores: Para restaurar la funcionalidad del boletín, el primer paso es crear la tabla `subscribers` a través de una nueva migración de Supabase. Una vez que la tabla exista y los tipos se regeneren, la `Server Action` `subscribeToNewsletterAction` podrá ser reintroducida de forma segura.
 * 2. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones. Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar la atomicidad (o todo tiene éxito, o todo falla).
 * 3. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica para registrar quién hizo qué, a qué y cuándo, lo cual es indispensable para la seguridad y el soporte.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones separadas. Si la segunda falla, el workspace queda en un estado inconsistente (sin miembros). Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar que ambas operaciones se completen con éxito o fallen juntas (atomicidad).
 * 2. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica (`createWorkspace`, `createSite`, `deleteSiteAsAdmin`, `updateUserRole`) para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad, el soporte al cliente y la depuración.
 * 3. Servicio de Email Transaccional: Reemplazar la redirección en `requestPasswordResetAction` por una integración real con un servicio de email como Resend o Postmark para enviar correos electrónicos de restablecimiento de contraseña más robustos y personalizables, en lugar de depender del flujo integrado de Supabase.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones separadas. Si la segunda falla, el workspace queda en un estado inconsistente (sin miembros). Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar que ambas operaciones se completen con éxito o fallen juntas (atomicidad).
 * 2. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica (`createWorkspace`, `createSite`, `deleteSiteAsAdmin`, `updateUserRole`) para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad, el soporte al cliente y la depuración.
 * 3. Servicio de Email Transaccional: Reemplazar la redirección en `requestPasswordResetAction` por una integración real con un servicio de email como Resend o Postmark para enviar correos electrónicos de restablecimiento de contraseña más robustos y personalizables, en lugar de depender del flujo integrado de Supabase.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones separadas. Si la segunda falla, el workspace queda en un estado inconsistente (sin miembros). Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar que ambas operaciones se completen con éxito o fallen juntas (atomicidad).
 * 2. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica (`createWorkspace`, `createSite`, `deleteSiteAsAdmin`, `updateUserRole`) para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad, el soporte al cliente y la depuración.
 * 3. Servicio de Email Transaccional: Reemplazar la redirección en `requestPasswordResetAction` por una integración real con un servicio de email como Resend o Postmark para enviar correos electrónicos de restablecimiento de contraseña más robustos y personalizables, en lugar de depender del flujo integrado de Supabase.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Transacciones Atómicas: La acción `createWorkspaceAction` realiza dos inserciones separadas. Si la segunda falla, el workspace queda en un estado inconsistente (sin miembros). Esta lógica debería ser envuelta en una única función de base de datos de PostgreSQL (llamada con `supabase.rpc()`) para garantizar que ambas operaciones se completen con éxito o fallen juntas (atomicidad).
 * 2. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica (`createWorkspace`, `createSite`, `deleteSiteAsAdmin`, `updateUserRole`) para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad, el soporte al cliente y la depuración.
 * 3. Servicio de Email Transaccional: Reemplazar la redirección en `requestPasswordResetAction` por una integración real con un servicio de email como Resend o Postmark para enviar correos electrónicos de restablecimiento de contraseña más robustos y personalizables, en lugar de depender del flujo integrado de Supabase.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Logging de Auditoría (Audit Trail): Implementar una tabla `audit_logs` y una función `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad y el soporte.
 * 2. Validación Zod Exhaustiva: Crear un archivo central `lib/schemas.ts` que exporte esquemas de Zod para todas las entradas de datos (`SiteSchema`, `InvitationSchema`, `CampaignConfigSchema`). Cada Server Action debe ser la primera línea de defensa validando sus argumentos contra estos esquemas.
 * 3. Implementar Servicio de Email Transaccional: Reemplazar la simulación de envío de correo por una integración real con un servicio como Resend o Postmark, especialmente para invitaciones y notificaciones, para garantizar la entrega fiable.
 * 1. **Logging de Auditoría (Audit Trail):** Implementar una tabla `audit_logs` y una función auxiliar `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad y el soporte.
 * 2. **Validación Zod Exhaustiva:** Crear un archivo central `lib/schemas.ts` que exporte esquemas de Zod para todas las entradas de datos (`SiteSchema`, `InvitationSchema`, `CampaignConfigSchema`). Cada Server Action debe ser la primera línea de defensa validando sus `formData` o argumentos contra estos esquemas.
 * 3. **Implementar Servicio de Email Transaccional:** Reemplazar la simulación de envío de correo en `sendWorkspaceInvitationAction` por una integración real con un servicio como Resend o Postmark. Esto es crucial para que las invitaciones lleguen a los usuarios de manera fiable y profesional.
 * 1. **Logging de Auditoría (Audit Trail):** Implementar una tabla `audit_logs` y una función auxiliar `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad y el soporte.
 * 2. **Validación Zod Exhaustiva:** Crear un archivo central `lib/schemas.ts` que exporte esquemas de Zod para todas las entradas de datos (`SiteSchema`, `InvitationSchema`, `CampaignConfigSchema`). Cada Server Action debe ser la primera línea de defensa validando sus `formData` o argumentos contra estos esquemas.
 * 3. **Implementar Servicio de Email Transaccional:** Reemplazar la simulación de envío de correo en `sendWorkspaceInvitationAction` por una integración real con un servicio como Resend o Postmark. Esto es crucial para que las invitaciones lleguen a los usuarios de manera fiable y profesional.
 * 1. **Logging de Auditoría (Audit Trail):** Implementar una tabla `audit_logs` y una función auxiliar `createAuditLog(actorId, action, targetId, metadata)`. Esta función debe ser llamada en cada acción crítica (`createSite`, `updateCampaignContent`, `sendWorkspaceInvitation`) para registrar quién hizo qué, a qué y cuándo. Esto es indispensable para la seguridad y el soporte.
 * 2. **Validación Zod Exhaustiva:** Crear un archivo central `lib/schemas.ts` que exporte esquemas de Zod para todas las entradas de datos (`SiteSchema`, `InvitationSchema`, `CampaignConfigSchema`). Cada Server Action debe ser la primera línea de defensa validando sus `formData` o argumentos contra estos esquemas.
 * 3. **Implementar Servicio de Email Transaccional:** Reemplazar la simulación de envío de correo en `sendWorkspaceInvitationAction` por una integración real con un servicio como Resend o Postmark. Esto es crucial para que las invitaciones lleguen a los usuarios de manera fiable y profesional.

 * 1. **Logging de Auditoría (Audit Trail):** Es fundamental implementar una tabla `audit_logs` en Supabase. Cada acción crítica (`createSite`, `deleteSite`, `updateCampaignContent`, `setActiveWorkspace`) debería insertar un registro con `user_id`, `action_type`, `target_id` y un `snapshot` del cambio. Esto es indispensable para la seguridad, el soporte al cliente y la depuración en producción.
 * 2. **Abstracción de Lógica de Permisos de Workspace:** La lógica para verificar si un usuario pertenece al workspace de una campaña se repetirá. Se debe crear una función auxiliar `verifyWorkspaceMembership(userId, campaignId)` que devuelva un booleano, simplificando las acciones y centralizando las reglas de negocio de permisos.
 * 3. **Validación de `CampaignConfig` con Zod:** Antes de guardar, el objeto `content` en `updateCampaignContentAction` debe ser validado contra un `CampaignConfigSchema` de Zod. Esto actúa como una barrera final contra la corrupción de datos, asegurando que solo las estructuras de página válidas lleguen a la base de datos.
 * 1. **Abstracción de Lógica de Permisos:** La verificación de pertenencia a un workspace es compleja y se repetirá. Crear una función auxiliar `verifyWorkspaceMembership(userId, workspaceId): Promise<boolean>` que encapsule esta lógica para simplificar las acciones.
 * 2. **Logging de Auditoría (Audit Trail):** Para cada acción crítica que modifica datos (`createSite`, `deleteSite`, `updateCampaignContent`), insertar un registro en una nueva tabla `audit_logs`. El registro debe contener `user_id`, `action_type`, `target_id` (ej. el `campaignId`), y un `snapshot` del cambio. Esto es indispensable para la seguridad y la depuración en producción.
 * 3. **Validación Zod para `CampaignConfig`:** Implementar un `CampaignConfigSchema` de Zod y usarlo en `updateCampaignContentAction` para validar el objeto `content` antes de guardarlo, previniendo la inyección de datos corruptos.
 * 1. **Implementar Validación Zod para `CampaignConfig`:** El `TODO` más crítico es definir un `CampaignConfigSchema` completo en Zod y usar `schema.safeParse(content)` dentro de `updateCampaignContentAction`. Esto es una red de seguridad vital para prevenir que datos malformados (por un bug o un ataque) se guarden en la base de datos.
 * 2. **Abstracción de Lógica de Pertenencia a Workspace:** La lógica para verificar si un usuario pertenece al workspace de una campaña es compleja y se repetirá. Se debería crear una función auxiliar `verifyWorkspaceMembership(userId, campaignId)` que encapsule esta lógica y devuelva `true` o `false`, simplificando las acciones.
 * 3. **Logging de Auditoría (Audit Trail):** Para cada acción crítica que modifica datos (`createSite`, `deleteSite`, `updateCampaignContent`), se debería insertar un registro en una nueva tabla `audit_logs`. El registro debe contener `user_id`, `action_type`, `target_id` (ej. el `campaignId`), y un `snapshot` del cambio. Esto es indispensable para la seguridad y la depuración en producción.
1.  **Abstracción de Tipos:** Mover tipos compartidos como `CreateSiteFormState` a un archivo
 *    dedicado (ej. `lib/types.ts`) para que puedan ser importados tanto en el cliente como
 *    en el servidor sin crear dependencias circulares.
2.  **Trigger de Membresía Automática:** Crear un Trigger en Supabase para añadir automáticamente al
 *    propietario como miembro 'admin' de su nuevo workspace.
3.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas
 *    y garantizar la consistencia de los datos.
1.  **Trigger de Membresía Automática:** Crear un Trigger de base de datos en Supabase que, cuando se crea un
 *    nuevo workspace, inserte automáticamente una fila en `workspace_members` asignando al `owner_id`
 *    el rol de 'admin' para ese workspace. Esto automatiza la configuración inicial de permisos.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno Estandarizado:** Implementar un tipo genérico como `ActionResult<T>` para estandarizar los retornos de las acciones.
4.  **Abstracción de Schemas:** Mover los schemas de Zod a su propio archivo (`lib/schemas.ts`).
1.  **Validación de Pertenencia a Workspace:** La acción `setActiveWorkspaceAction` debe incluir una verificación
 *    para asegurar que el usuario que la invoca es realmente miembro del `workspaceId` que intenta activar.
 *    Esto previene que un usuario pueda establecer como activa una organización a la que no pertenece.
2.  **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña
 *    por defecto"), usar funciones de base de datos de PostgreSQL (`supabase.rpc()`) para envolver múltiples
 *    operaciones en una única transacción atómica, garantizando la consistencia de los datos.
3.  **Tipado de Retorno Estandarizado:** Implementar un tipo genérico como
 *    `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar
 *    los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible y
 *    seguro en tipos.
4.  **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio
 *    archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión para que `createSiteAction` sepa dónde crear el nuevo sitio.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Asociar Subdominios a Usuarios:** Descomentar y activar la lógica para obtener el `userId` de la sesión y guardarlo junto con los datos del subdominio en Redis. Esto es fundamental para la lógica multi-tenant.
2.  **Verificación de Permisos:** En `deleteSubdomainAction`, implementar la comprobación de que el usuario que realiza la acción es el propietario del subdominio o tiene un rol de administrador.
3.  **Flujo de Reseteo de Contraseña:** Añadir una nueva Server Action para manejar la solicitud de reseteo de contraseña, que llamará a `supabase.auth.resetPasswordForEmail()`.
 * 1. **Trigger de Creación de Workspace:** Implementar un trigger de base de datos en Supabase que, después de que un nuevo usuario se inserte en `auth.users`, cree automáticamente una entrada en la tabla `profiles` y un `workspace` inicial del cual el nuevo usuario sea el propietario. Esto automatiza el onboarding.
 * 2. **Gestión de Múltiples Workspaces:** Desarrollar la lógica para que un usuario pueda pertenecer a múltiples workspaces y seleccionar uno activo. Esto implicaría una página de selección, una acción para actualizar una columna `active_workspace_id` en el perfil del usuario, y modificar `getAuthenticatedUser` para que también devuelva el workspace activo.
 * 3. **Tipado de Retorno Estandarizado:** Crear un tipo genérico `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible.
 * 4. **Abstracción de Schemas:** Mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 1. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica, garantizando la consistencia de los datos.
 * 2. **Contexto en Logs:** Enriquecer los logs con más contexto, como un ID de petición único, para poder trazar una acción completa a través de múltiples logs, especialmente en un entorno de producción con muchas peticiones concurrentes.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 4. **Tipado de Retorno Estandarizado:** Crear un tipo genérico `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible.
 * 1. **Actualización de Sesión en Vivo:** La acción `selectActiveWorkspaceAction` actualmente redirige. Una mejora avanzada sería usar una futura función `auth.update({ ... })` para actualizar el token de sesión en vivo sin necesidad de una redirección completa, proporcionando una UX instantánea.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica, garantizando la consistencia de los datos.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Actualización de Sesión en Vivo:** La acción `selectActiveWorkspaceAction` actualmente redirige. Una mejora avanzada sería usar la (aún experimental en Auth.js v5) función `auth.update({ ... })` para actualizar el token de sesión en vivo sin necesidad de una redirección completa, proporcionando una UX instantánea.
 * 2. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Selector de Workspace Activo:** La acción `createSiteAction` asume que `active_workspace_id` está en la sesión. El siguiente paso es implementar la lógica (en el login o en el UI del dashboard) para establecer qué workspace está activo para el usuario.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Selector de Workspace Activo:** La acción `createSiteAction` asume que `active_workspace_id` está en la sesión. El siguiente paso es implementar la lógica (en el login o en el UI del dashboard) para establecer qué workspace está activo para el usuario.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry, que ya estaba en el otro proyecto) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 */
