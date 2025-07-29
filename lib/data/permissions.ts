// Ruta: lib/data/permissions.ts (REFACTORIZADO/NUEVO)
"use server";

import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";
import { logger } from "@/lib/logging";

// Exportamos el tipo para que sea reutilizable en toda la aplicación.
export type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @file permissions.ts
 * @description Aparato de datos especializado en la lógica de autorización.
 *              Esta es la ÚNICA fuente de verdad para verificar los permisos
 *              de un usuario dentro de un contexto de workspace.
 * @author L.I.A Legacy
 * @version 1.0.0
 */

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
  // Por seguridad, si no se proporcionan roles requeridos, denegar acceso.
  if (!requiredRoles || requiredRoles.length === 0) {
    return false;
  }

  const supabase = createClient();

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (error) {
    // El código 'PGRST116' significa 'Not Found', lo cual es un resultado esperado
    // si el usuario no es miembro, por lo que no lo registramos como un error.
    if (error.code !== "PGRST116") {
      logger.error(
        `Error al verificar permisos para usuario ${userId} en workspace ${workspaceId}:`,
        error
      );
    }
    return false;
  }

  // Si se encuentra la membresía, verificar si su rol está en la lista de roles requeridos.
  return requiredRoles.includes(member.role);
}
