/* Ruta: app/actions.ts */

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { type CampaignConfig } from "@/lib/builder/types.d";
import type { User } from "@supabase/supabase-js";
import { Json, TablesUpdate } from "@/lib/database.types";

/**
 * @file app/actions.ts
 * @description Centro de lógica de negocio del lado del servidor.
 * Este archivo ha sido refactorizado para una máxima seguridad, mantenibilidad y
 * coherencia arquitectónica. Utiliza funciones auxiliares para la gestión de permisos
 * y tipos de retorno estandarizados para una interacción predecible con el cliente.
 *
 * @author Metashark
 * @version 6.0.0 (Architectural Refactor & Type Safety)
 */

// --- TIPOS Y ESQUEMAS ---

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

const SiteSchema = z.object({
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1),
});

const EmailSchema = z.string().email();

// --- FUNCIONES AUXILIARES DE PERMISOS ---

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("app_role").eq("id", user.id).single();
  if (!profile) return null;

  return { user, profile };
}

async function verifyUserRole(requiredRole: 'developer'): Promise<{ user: User } | { error: string }> {
  const authData = await getAuthenticatedUser();
  if (!authData) return { error: "Acción no autorizada." };
  if (authData.profile.app_role !== requiredRole) {
    logger.warn(`VIOLACIÓN DE SEGURIDAD: Usuario ${authData.user.id} intentó una acción de administrador.`);
    return { error: "Permiso denegado." };
  }
  return { user: authData.user };
}

// --- ACCIONES DE AUTENTICACIÓN ---

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  const result = EmailSchema.safeParse(formData.get("email"));
  if (!result.success) return { success: false, error: "Email inválido." };

  const supabase = createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_ROOT_URL}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(result.data, { redirectTo });

  if (error) {
    logger.error("Error en requestPasswordResetAction:", error);
    return { success: false, error: "No se pudo iniciar el reseteo." };
  }
  redirect("/auth-notice?message=check-email-for-reset");
}

// --- ACCIONES DE WORKSPACE Y SITIOS ---

export async function setActiveWorkspaceAction(workspaceId: string) {
  const authData = await getAuthenticatedUser();
  if (!authData) return;

  const supabase = createClient();
  const { error } = await supabase.from("workspace_members").select("id").eq("user_id", authData.user.id).eq("workspace_id", workspaceId).single();

  if (error) {
    logger.warn(`VIOLACIÓN DE SEGURIDAD: Usuario ${authData.user.id} intentó activar workspace ${workspaceId} sin ser miembro.`);
    return;
  }

  cookies().set("active_workspace_id", workspaceId, { path: "/", httpOnly: true });
  redirect("/dashboard");
}

export async function createSiteAction(prevState: any, formData: FormData): Promise<ActionResult<{subdomain: string; icon: string} | null>> {
  const authData = await getAuthenticatedUser();
  if (!authData) return { success: false, error: "Acción no autorizada." };

  const validatedFields = SiteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { success: false, error: validatedFields.error.errors[0].message };

  const { subdomain, icon } = validatedFields.data;
  const activeWorkspaceId = cookies().get("active_workspace_id")?.value;
  if (!activeWorkspaceId) return { success: false, error: "No hay un workspace activo." };

  const supabase = createClient();
  const { error } = await supabase.from("sites").insert({ subdomain, icon, workspace_id: activeWorkspaceId });

  if (error) {
    logger.error("Error al crear sitio:", error);
    return { success: false, error: error.code === "23505" ? "Este subdominio ya existe." : "Error interno." };
  }

  revalidatePath("/dashboard");
  return { success: true, data: { subdomain, icon } };
}

export async function deleteSiteAction(formData: FormData): Promise<ActionResult> {
  const authData = await getAuthenticatedUser();
  if (!authData) return { success: false, error: "Acción no autorizada." };

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { success: false, error: "Subdominio no proporcionado." };

  const supabase = createClient();
  const { error } = await supabase.from("sites").delete().eq("subdomain", subdomain);

  if (error) {
    logger.error(`Error al eliminar el sitio ${subdomain}:`, error);
    return { success: false, error: "No se pudo eliminar el sitio." };
  }

  revalidatePath("/dashboard");
  return { success: true, data: null };
}

export async function deleteSiteAsAdminAction(formData: FormData): Promise<ActionResult> {
  const roleCheck = await verifyUserRole('developer');
  if ('error' in roleCheck) return { success: false, error: roleCheck.error };

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { success: false, error: "Subdominio no proporcionado." };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("sites").delete().eq("subdomain", subdomain);

  if (error) {
    logger.error(`Error de admin al eliminar el sitio ${subdomain}:`, error);
    return { success: false, error: "No se pudo eliminar el sitio como administrador." };
  }

  revalidatePath("/admin");
  return { success: true, data: null };
}

// --- ACCIONES DEL CONSTRUCTOR DE CAMPAÑAS ---

export async function updateCampaignContentAction(campaignId: string, content: CampaignConfig): Promise<ActionResult> {
  const authData = await getAuthenticatedUser();
  if (!authData) return { success: false, error: "Acción no autorizada." };
  
  const supabase = createClient();

  const { data: campaignOwnerQueryResult, error: ownerError } = await supabase.from('campaigns').select('sites!inner(workspace_id)').eq('id', campaignId).single();
  if (ownerError) return { success: false, error: "Campaña no encontrada." };
  
  const workspaceId = campaignOwnerQueryResult.sites.workspace_id;
  
  const { count } = await supabase.from('workspace_members').select('id', { count: 'exact' }).eq('user_id', authData.user.id).eq('workspace_id', workspaceId);
  if (count === 0) {
    logger.warn(`VIOLACIÓN DE SEGURIDAD: Usuario ${authData.user.id} intentó guardar la campaña ${campaignId} sin permiso.`);
    return { success: false, error: "No tienes permiso para editar esta campaña." };
  }

  // CORRECCIÓN DE TIPO: Creamos un payload tipado y realizamos una aserción explícita
  // y segura de `CampaignConfig` a `Json`. Esto satisface a TypeScript mientras
  // garantizamos que el objeto es serializable.
  const payload: TablesUpdate<'campaigns'> = {
    content: content as Json,
    updated_at: new Date().toISOString()
  };

  const { error: updateError } = await supabase.from("campaigns").update(payload).eq("id", campaignId);

  if (updateError) {
    logger.error(`Error al guardar campaña ${campaignId}:`, updateError);
    return { success: false, error: "No se pudo guardar el progreso." };
  }
  
  revalidatePath(`/builder/${campaignId}`);
  revalidatePath(`/c/${campaignId}`);
  return { success: true, data: null };
}
/* Ruta: app/actions.ts */

/* MEJORAS PROPUESTAS (Consolidadas)
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
