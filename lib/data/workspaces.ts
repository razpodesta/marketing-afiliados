// lib/data/workspaces.ts
/**
 * @file workspaces.ts
 * @description Aparato de datos especializado para la entidad 'workspaces'.
 *              Ha sido optimizado con `unstable_cache` de Next.js para un
 *              rendimiento de nivel de producción en cargas de layout.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.0.0 (Server-Side Caching Optimization)
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

export type Workspace = Tables<"workspaces">;

/**
 * @async
 * @function getWorkspacesByUserId
 * @description Obtiene todos los workspaces de un usuario, con una capa de caché de alto rendimiento.
 * @param {string} userId - El UUID del usuario.
 * @returns {Promise<Workspace[]>} Una promesa que resuelve a un array de workspaces.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getWorkspacesByUserId(
  userId: string
): Promise<Workspace[]> {
  // --- INICIO DE REFACTORIZACIÓN DE RENDIMIENTO ---
  return cache(
    async () => {
      logger.info(
        `[Cache MISS] Cargando workspaces desde DB para usuario ${userId}.`
      );
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspaces(*)")
        .eq("user_id", userId);

      if (error) {
        logger.error(
          `Error al obtener workspaces para el usuario ${userId}:`,
          error
        );
        // Devolvemos un array vacío en caso de error para evitar crashear el layout.
        return [];
      }

      const workspaces: Workspace[] = data.flatMap(
        (item) => item.workspaces || []
      );
      return workspaces;
    },
    [`user-workspaces-${userId}`], // Clave de caché única y específica.
    {
      tags: [`workspaces:${userId}`], // Tag para invalidación granular.
    }
  )();
  // --- FIN DE REFACTORIZACIÓN DE RENDIMIENTO ---
}

/**
 * @async
 * @function getFirstWorkspaceForUser
 * @description Obtiene el primer workspace disponible para un usuario.
 * @param {string} userId - El UUID del usuario.
 * @returns {Promise<Workspace | null>} El primer workspace encontrado o null.
 */
export async function getFirstWorkspaceForUser(
  userId: string
): Promise<Workspace | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspaces(*)")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(
        `Error al obtener el primer workspace para el usuario ${userId}:`,
        error
      );
    }
    return null;
  }

  const workspaceData = data?.workspaces;
  const workspace: Workspace | null =
    workspaceData && !Array.isArray(workspaceData) ? workspaceData : null;

  return workspace;
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Función `getWorkspaceDetails`**: ((Vigente)) Crear una nueva función que obtenga el workspace, una lista paginada de sus miembros y sus roles.
 *
 * @subsection Mejoras Implementadas
 * 1. **Cacheo del Lado del Servidor**: ((Implementada)) Se ha envuelto `getWorkspacesByUserId` en `unstable_cache` de Next.js, mejorando drásticamente el rendimiento de la carga del layout del dashboard. La caché utiliza tags para permitir una invalidación precisa.
 */
// lib/data/workspaces.ts
