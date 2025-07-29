// Ruta: lib/data/workspaces.ts (REFACTORIZADO/NUEVO)
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

/**
 * @file workspaces.ts
 * @description Aparato de datos especializado para todas las consultas
 *              relacionadas con la entidad 'workspaces'.
 * @author L.I.A Legacy
 * @version 1.0.0
 */

// Exportamos el tipo para que sea reutilizable, por ejemplo, en el DashboardContext.
export type Workspace = Tables<"workspaces">;

/**
 * @description Obtiene todos los workspaces a los que pertenece un usuario.
 *              Esta es una consulta clave para el layout del dashboard, ya que
 *              puebla el selector de workspaces y establece el contexto inicial.
 *              La consulta se realiza a través de la tabla de unión 'workspace_members'.
 * @param {string} userId - El UUID del usuario para el que se obtienen los workspaces.
 * @returns {Promise<Workspace[]>} Una promesa que resuelve a un array de workspaces.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export async function getWorkspacesByUserId(
  userId: string
): Promise<Workspace[]> {
  const supabase = createClient();

  // CONSULTA OPTIMIZADA:
  // 1. Empezamos desde `workspace_members` para filtrar por el usuario.
  // 2. Usamos el 'select' con relaciones de Supabase para obtener todos los datos
  //    de la tabla `workspaces` asociada (*). Esto es más eficiente que hacer dos consultas separadas.
  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      workspaces (*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    logger.error(
      `Error al obtener los workspaces para el usuario ${userId}:`,
      error
    );
    throw new Error("No se pudieron cargar los datos de los workspaces.");
  }

  // La consulta devuelve un array de objetos { workspaces: Workspace | null }.
  // Lo aplanamos y filtramos cualquier posible resultado nulo para devolver un array limpio de Workspaces.
  const workspaces = data
    .map((item) => item.workspaces)
    .filter((ws): ws is Workspace => ws !== null);

  return workspaces;
}

/**
 * @description Obtiene el primer workspace disponible para un usuario.
 *              Útil para establecer el contexto por defecto en el middleware
 *              durante el primer inicio de sesión del usuario.
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
    .single(); // .single() para obtener un solo objeto en lugar de un array

  if (error) {
    if (error.code !== "PGRST116") {
      // No registrar un error si simplemente no se encuentra (PGRST116).
      logger.error(
        `Error al obtener el primer workspace para el usuario ${userId}:`,
        error
      );
    }
    return null;
  }

  return data?.workspaces ?? null;
}

/*
 **[Análisis de Impacto]:**
 *   **Centralización:** El `DashboardLayout` ahora llamará a `getWorkspacesByUserId` en lugar de contener la lógica de la consulta. El `middleware` llamará a `getFirstWorkspaceForUser` para establecer la cookie inicial. Esto respeta la separación de responsabilidades.
 *   **Eficiencia:** La consulta a través de `workspace_members` es la forma correcta de obtener los datos en una relación muchos-a-muchos, usando un índice en `user_id` para un rendimiento óptimo.
 *   **Robustez:** El aplanamiento y filtrado de la respuesta asegura que el tipo de retorno sea siempre `Workspace[]`, eliminando ambigüedades.
 */
