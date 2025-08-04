// lib/actions/admin.actions.ts
/**
 * @file lib/actions/admin.actions.ts
 * @description Contiene Server Actions restringidas a roles administrativos ('admin', 'developer').
 *              Estas acciones son sensibles y exigen verficación rigurosa de permisos
 *              utilizando el guardián de seguridad `requireAppRole`. Este aparato se
 *              entrega sin cambios lógicos pero con documentación y estándares de calidad
 *              reforzados para cumplir con el protocolo de entrega.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.0.0 (Secure & Auditable Admin Operations)
 * @see {@link file://./tests/lib/actions/admin.actions.test.ts} Para el arnés de pruebas correspondiente.
 */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAppRole } from "@/lib/auth/user-permissions";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function impersonateUserAction
 * @description Permite a un 'developer' iniciar sesión como otro usuario.
 *              Genera un enlace mágico de un solo uso. Es una herramienta de depuración de alto privilegio.
 * @param {string} userId - El ID del usuario a suplantar.
 * @returns {Promise<ActionResult<{ signInLink: string }>>} El resultado de la operación, que puede ser un éxito con el enlace o un fallo con un error.
 */
export async function impersonateUserAction(
  userId: string
): Promise<ActionResult<{ signInLink: string }>> {
  const roleCheck = await requireAppRole(["developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  if (roleCheck.data.user.id === userId) {
    return { success: false, error: "No puedes suplantarte a ti mismo." };
  }

  const adminSupabase = createAdminClient();
  const { data: userData, error: userError } =
    await adminSupabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    logger.error(
      `[AdminActions] Error al obtener usuario para suplantación ${userId}:`,
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
      `[AdminActions] Error al generar link de suplantación para ${userId}:`,
      error
    );
    return {
      success: false,
      error: "No se pudo generar el link de suplantación.",
    };
  }

  await createAuditLog("user_impersonated", {
    userId: roleCheck.data.user.id,
    targetEntityId: userId,
    targetEntityType: "user",
    metadata: { impersonatedEmail: userData.user.email },
  });

  return { success: true, data: { signInLink: data.properties.action_link } };
}

/**
 * @async
 * @function deleteSiteAsAdminAction
 * @description Permite a un 'admin' o 'developer' eliminar permanentemente un sitio.
 * @param {FormData} formData - Datos del formulario que contienen el 'subdomain'.
 * @returns {Promise<ActionResult<{ message: string }>>} El resultado de la operación.
 */
export async function deleteSiteAsAdminAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const roleCheck = await requireAppRole(["admin", "developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { success: false, error: "Subdominio ausente." };

  const adminSupabase = createAdminClient();
  const { error, data: deletedSite } = await adminSupabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain)
    .select("id, subdomain")
    .single();

  if (error || !deletedSite) {
    logger.error(
      `[AdminActions] Error al eliminar el sitio ${subdomain}:`,
      error
    );
    return { success: false, error: "No se pudo eliminar el sitio." };
  }

  revalidateTag(`sites:${subdomain}`);
  revalidatePath("/admin");

  await createAuditLog("site_deleted_admin", {
    userId: roleCheck.data.user.id,
    targetEntityId: deletedSite.id,
    targetEntityType: "site",
    metadata: { subdomain: deletedSite.subdomain },
  });

  return {
    success: true,
    data: { message: `Sitio ${subdomain} eliminado correctamente.` },
  };
}

/**
 * @async
 * @function updateUserRoleAction
 * @description Permite a un 'developer' cambiar el rol de aplicación de otro usuario.
 * @param {string} userId - El ID del usuario cuyo rol se va a modificar.
 * @param {Database["public"]["Enums"]["app_role"]} newRole - El nuevo rol a asignar.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación.
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: Database["public"]["Enums"]["app_role"]
): Promise<ActionResult<void>> {
  const roleCheck = await requireAppRole(["developer"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  if (roleCheck.data.user.id === userId) {
    return { success: false, error: "No puedes cambiar tu propio rol." };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ app_role: newRole })
    .eq("id", userId);

  if (error) {
    logger.error(
      `[AdminActions] Error al actualizar rol para ${userId}:`,
      error
    );
    return { success: false, error: "No se pudo actualizar el rol." };
  }

  revalidatePath("/dev-console/users");

  await createAuditLog("user_role_updated", {
    userId: roleCheck.data.user.id,
    targetEntityId: userId,
    targetEntityType: "user",
    metadata: { newRole },
  });

  return { success: true, data: undefined };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Transacciones de Base de Datos**: ((Vigente)) Para operaciones que involucran múltiples escrituras (ej. `deleteSite` y todas sus campañas asociadas), envolverlas en una transacción (RPC) para garantizar la atomicidad.
 * 2. **Protección Contra Auto-Modificación Crítica**: ((Vigente)) Implementar lógica para impedir que el último administrador/desarrollador sea degradado de rol o que su cuenta sea eliminada, para evitar un bloqueo total del sistema.
 * 3. **Mensajes de Error Específicos**: ((Vigente)) Mapear códigos de error de Supabase (ej. '23503' para violación de clave foránea) a mensajes de error más amigables para el usuario en la UI.
 */
// lib/actions/admin.actions.ts
