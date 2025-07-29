// Ruta: lib/auth/permissions.ts
/**
 * @file permissions.ts
 * @description Módulo centralizado para la lógica de autorización.
 *              Esta es la única fuente de verdad para verificar los permisos
 *              de un usuario dentro de un contexto de workspace.
 *
 * @author L.I.A Legacy
 * @version 1.1.0 (Stability Correction)
 */
"use server";

// <-- CORRECCIÓN: Rutas de importación ajustadas a la ubicación del archivo.
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @description Verifica si un usuario tiene uno de los roles requeridos en un workspace específico.
 * @param {string} userId - El UUID del usuario a verificar.
 * @param {string} workspaceId - El UUID del workspace en el que se requiere el permiso.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles que otorgan el permiso.
 * @returns {Promise<boolean>} Devuelve `true` si el usuario tiene el permiso, `false` en caso contrario.
 */
export async function hasWorkspacePermission(
  userId: string,
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<boolean> {
  const supabase = createClient();

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !member) {
    if (error && error.code !== "PGRST116") {
      // PGRST116: 'Not Found'
      logger.error(
        `Error al verificar permisos para usuario ${userId} en workspace ${workspaceId}:`,
        error
      );
    }
    return false;
  }

  return requiredRoles.includes(member.role);
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Soft Deletes: Implementar un sistema de borrado lógico añadiendo un campo `deleted_at` a la tabla `sites`. La `deleteSiteAction` actualizaría este campo en lugar de una eliminación permanente, permitiendo la recuperación de datos.
 * 2. Update Site Action: Crear una nueva acción `updateSiteAction` para modificar detalles de un sitio (ej. cambiar el ícono o el subdominio). Esta acción deberá reutilizar el helper `hasWorkspacePermission` para la validación.
 * 3. Garantizar Integridad de Datos con Cascade Deletes: A nivel de base de datos, es crucial establecer una política `ON DELETE CASCADE` en la clave foránea `campaigns.site_id`. Esto asegura que al eliminar un sitio, todas sus campañas y datos asociados se eliminen automáticamente, previniendo datos huérfanos.
 */
