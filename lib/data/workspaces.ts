// Ruta: lib/data/workspaces.ts
/**
 * @file workspaces.ts
 * @description Aparato de datos especializado para todas las consultas
 *              relacionadas con la entidad 'workspaces'. Esta es la única
 *              interfaz permitida para acceder a los datos de los workspaces,
 *              garantizando consistencia, seguridad y rendimiento.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.3.0 (Robust Data Transformation with flatMap)
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

export type Workspace = Tables<"workspaces">;

/**
 * @async
 * @function getWorkspacesByUserId
 * @description Obtiene todos los workspaces a los que pertenece un usuario.
 * @param {string} userId - El UUID del usuario.
 * @returns {Promise<Workspace[]>} Una promesa que resuelve a un array de workspaces.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getWorkspacesByUserId(
  userId: string
): Promise<Workspace[]> {
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
    throw new Error("No se pudieron cargar los datos de los workspaces.");
  }

  // CORRECCIÓN ARQUITECTÓNICA: La consulta con join devuelve [{ workspaces: {...} }].
  // Usamos .flatMap() para mapear y aplanar la estructura en un solo paso.
  // Si item.workspaces es null o undefined, flatMap lo omite automáticamente.
  // Esto resuelve el error de tipos de forma robusta y concisa.
  const workspaces: Workspace[] = data.flatMap((item) => item.workspaces || []);

  return workspaces;
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
// Ruta: lib/data/workspaces.ts

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `workspaces.ts` es un componente fundamental de la Capa de Datos.
 *
 * @functionality
 * - Abstrae y centraliza todas las consultas a la base de datos relacionadas con `workspaces`.
 * - **Corrección Crítica:** La causa raíz de los errores `TS2322` y `TS2677` era
 *   un desajuste en el contrato de datos. La consulta `select("workspaces(*)")` desde
 *   `workspace_members` devuelve una estructura anidada `[{ workspaces: object }]`. Sin embargo,
 *   la función prometía devolver un `Workspace[]` plano. La lógica de transformación `.map()`
 *   y `.filter()` que hemos implementado actúa como un "adaptador", aplanando la estructura de
 *   datos para que cumpla con el contrato de tipo esperado por el resto de la aplicación.
 *   Esto sella la fisura de integridad de tipos en su origen.
 *
 * @relationships
 * - Es consumido por `lib/actions/workspaces.actions.ts` y `app/[locale]/dashboard/layout.tsx`.
 *
 * @expectations
 * - Se espera que este aparato sea la única vía de acceso a los datos de los workspaces.
 *   Con esta refactorización, garantizamos que toda la aplicación opere con datos consistentes
 *   y correctamente tipados, eliminando la cascada de errores.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la gestión de datos de workspaces.
 *
 * 1.  **Función `getWorkspaceDetails`:** Crear una nueva función que obtenga el workspace, una lista paginada de sus miembros y sus roles.
 * 2.  **Cacheo de Datos:** La función `getWorkspacesByUserId` es una candidata ideal para ser cacheada con `unstable_cache` de Next.js.
 * 3.  **Búsqueda de Workspaces:** Implementar una función `searchWorkspacesByUserId(userId, query)` para ser utilizada en el `WorkspaceSwitcher`.
 */
// Ruta: lib/data/workspaces.ts
