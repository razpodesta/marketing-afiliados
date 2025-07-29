// Ruta: app/actions/admin.actions.ts
/**
 * @file app/actions/admin.actions.ts
 * @description Contiene Server Actions restringidas a roles administrativos ('admin', 'developer').
 * REFACTORIZACIÓN DE MÓDULO Y FUNCIONALIDAD: Se ha corregido el error de exportación
 * eliminando la declaración local de `ActionResult` y importándola desde el
 * módulo de esquemas centralizado. Se ha implementado la mejora "Acción de Suplantación",
 * añadiendo la potente `impersonateUserAction` para depuración.
 *
 * @author Metashark
 * @version 2.1.0 (Shared Types & User Impersonation)
 */

"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { type Database } from "@/lib/types/database";
import { revalidatePath, revalidateTag } from "next/cache";
import { type User } from "@supabase/supabase-js";
import { type ActionResult } from "./schemas"; // <-- CORRECCIÓN: Importación desde la fuente central.
import { redirect } from "next/navigation";

/**
 * @description Obtiene el usuario autenticado y su perfil desde la base de datos.
 * @returns {Promise<{user: User, profile: {app_role: Database["public"]["Enums"]["app_role"]}} | null>}
 */
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

/**
 * @description Verifica si el usuario autenticado tiene uno de los roles requeridos.
 * @param {Array<Database["public"]["Enums"]["app_role"]>} requiredRoles - Los roles permitidos.
 * @returns {Promise<{user: User, profile: {app_role: Database["public"]["Enums"]["app_role"]}} | {error: string}>}
 */
async function verifyUserRole(
  requiredRoles: Array<Database["public"]["Enums"]["app_role"]>
) {
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

/**
 * @description Genera un enlace de inicio de sesión mágico para suplantar a un usuario.
 *              Restringido al rol 'developer'.
 * @param {string} userId - El ID del usuario a suplantar.
 * @returns {Promise<ActionResult<{ signInLink: string }>>} El resultado con el enlace de inicio de sesión.
 */
export async function impersonateUserAction(
  userId: string
): Promise<ActionResult<{ signInLink: string }>> {
  const roleCheck = await verifyUserRole(["developer"]);
  if ("error" in roleCheck) return { success: false, error: roleCheck.error };

  if (roleCheck.user.id === userId) {
    return { success: false, error: "No puedes suplantarte a ti mismo." };
  }

  const adminSupabase = createAdminClient();
  const { data: userData, error: userError } =
    await adminSupabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    logger.error(
      `Error al obtener usuario para suplantación ${userId}:`,
      userError
    );
    return { success: false, error: "Usuario no encontrado." };
  }

  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: userData.user.email!,
  });

  if (error) {
    logger.error(
      `Error al generar enlace de suplantación para ${userId}:`,
      error
    );
    return {
      success: false,
      error: "No se pudo generar el enlace de suplantación.",
    };
  }

  const signInLink = data.properties.action_link;

  return { success: true, data: { signInLink } };
}

/**
 * @description Elimina un sitio de la plataforma.
 * @param {FormData} formData - Debe contener el 'subdomain' a eliminar.
 * @returns {Promise<ActionResult<{ message: string }>>} El resultado de la operación.
 */
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

/**
 * @description Actualiza el rol de un usuario. Acción restringida al rol 'developer'.
 * @param {string} userId - El UUID del usuario a modificar.
 * @param {Database["public"]["Enums"]["app_role"]} newRole - El nuevo rol a asignar.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
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
 * 1. Logging de Auditoría: Implementar una función `createAuditLog` que se llame desde acciones críticas como `updateUserRoleAction` y `impersonateUserAction` para registrar quién hizo qué, a quién y cuándo.
 * 2. Permisos Más Granulares: En lugar de un `verifyUserRole` genérico, se podrían crear hooks de permisos más específicos como `ensureIsDeveloper()` que arrojen errores, simplificando el código de las acciones.
 * 3. Manejo de Errores Centralizado: Crear un wrapper para las Server Actions que centralice el manejo de errores (try/catch), el logging y la validación de sesión para reducir el código repetitivo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Logging de Auditoría: Implementar una función `createAuditLog` que se llame desde acciones críticas como `updateUserRoleAction` y `impersonateUserAction` para registrar quién hizo qué, a quién y cuándo.
 * 2. Permisos Más Granulares: En lugar de un `verifyUserRole` genérico, se podrían crear hooks de permisos más específicos como `ensureIsDeveloper()` que arrojen errores, simplificando el código de las acciones.
 * 3. Manejo de Errores Centralizado: Crear un wrapper para las Server Actions que centralice el manejo de errores (try/catch), el logging y la validación de sesión para reducir el código repetitivo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Logging de Auditoría: Implementar una función `createAuditLog` que se llame desde acciones críticas como `updateUserRoleAction` y `impersonateUserAction` para registrar quién hizo qué, a quién y cuándo.
 * 2. Permisos Más Granulares: En lugar de un `verifyUserRole` genérico, se podrían crear hooks de permisos más específicos como `ensureIsDeveloper()` que arrojen errores, simplificando el código de las acciones.
 * 3. Manejo de Errores Centralizado: Crear un wrapper para las Server Actions que centralice el manejo de errores (try/catch), el logging y la validación de sesión para reducir el código repetitivo.
 */
