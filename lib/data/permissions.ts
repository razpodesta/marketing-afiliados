// lib/data/permissions.ts
/**
 * @file permissions.ts
 * @description Módulo centralizado para la lógica de autorización.
 *              Ha sido optimizado con caché de servidor para un rendimiento
 *              de nivel de producción en comprobaciones de permisos repetitivas.
 * @author L.I.A Legacy
 * @version 2.0.0 (Server-Side Caching Optimization)
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

export type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @async
 * @function hasWorkspacePermission
 * @description Verifica si un usuario tiene uno de los roles requeridos en un workspace específico.
 *              El resultado de esta función es cacheado para optimizar el rendimiento.
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
  return cache(
    async () => {
      logger.info(
        `[Cache MISS] Verificando permisos en DB para user:${userId} en ws:${workspaceId}`
      );
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
        if (error.code !== "PGRST116") {
          logger.error(
            `Error al verificar permisos para ${userId} en ${workspaceId}:`,
            error
          );
        }
        return false;
      }

      return requiredRoles.includes(member.role);
    },
    [`permission-${userId}-${workspaceId}`],
    {
      tags: [`permissions:${userId}`, `permissions:workspace:${workspaceId}`],
    }
  )();
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Permisos a Nivel de Aplicación**: ((Vigente)) Crear una función `hasAppPermission(userId, requiredRoles)` que verifique el `app_role` en la tabla `profiles`.
 *
 * @subsection Mejoras Implementadas
 * 1. **Cacheo de Servidor**: ((Implementada)) La función ahora utiliza `unstable_cache` con tags para una invalidación granular, reduciendo drásticamente la carga en la base de datos para comprobaciones de permisos repetitivas.
 */
// lib/data/permissions.ts
