/* Ruta: lib/data/sites.ts */

"use server"; // <-- DIRECTIVA DE RUNTIME AÑADIDA

import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/database.types";
import { logger } from "@/lib/logging";

/**
 * @file sites.ts
 * @description Capa de Acceso a Datos para la entidad 'sites'.
 * REFUERZO DE RUNTIME: Se ha añadido la directiva `'use server'` al principio
 * del archivo. Esto instruye explícitamente a Next.js y Vercel para que utilicen
 * siempre el entorno de ejecución de Node.js completo para este módulo, lo que
 * resuelve las advertencias de compatibilidad con el Edge Runtime causadas por
 * las dependencias de Supabase.
 *
 * @author Metashark
 * @version 2.1.0 (Node.js Runtime Enforcement)
 */
export type Site = Database["public"]["Tables"]["sites"]["Row"];

/**
 * @description Obtiene los datos de un sitio específico a partir de su subdominio.
 * Es crucial para la lógica de enrutamiento del middleware.
 * @param {string} subdomain - El subdominio a buscar.
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataBySubdomain(
  subdomain: string
): Promise<Site | null> {
  const supabase = createClient();
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("subdomain", sanitizedSubdomain)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116: 'single' row not found, lo cual es un resultado esperado y no un error.
    logger.error(`Error al obtener datos del sitio para ${subdomain}:`, error);
    return null;
  }

  return data;
}

/**
 * @description Obtiene todos los sitios de la plataforma (acción de administrador).
 * @returns {Promise<Site[]>} Una lista de todos los sitios.
 */
export async function getAllSites(): Promise<Site[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error al obtener todos los sitios:", error);
    return [];
  }
  return data;
}

/**
 * @description Obtiene todos los sitios que pertenecen a un workspace específico.
 * @param {string} workspaceId - El ID del workspace.
 * @returns {Promise<Site[]>} Una lista de los sitios del workspace.
 */
export async function getSitesByWorkspaceId(
  workspaceId: string
): Promise<Site[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      `Error al obtener sitios para el workspace ${workspaceId}:`,
      error
    );
    return [];
  }
  return data;
}
/* Ruta: lib/data/sites.ts */

/* MEJORAS PROPUESTAS
 * 1. **Capa de Caché con Revalidación por Tags:** En lugar de una simple caché basada en tiempo, implementar la caché `unstable_cache` de Next.js con revalidación basada en tags. Por ejemplo, `getSiteDataBySubdomain` podría ser cacheado con el tag `sites:${subdomain}`. Cuando un sitio se actualiza, una Server Action llamaría a `revalidateTag('sites:...')` para invalidar solo esa entrada específica de la caché, logrando un rendimiento máximo y datos siempre frescos.
 * 2. **Paginación Robusta:** Refactorizar `getAllSites` y `getSitesByWorkspaceId` para que acepten un objeto de opciones `{ page: number, limit: number }`. Estas funciones deberían devolver no solo los datos, sino también metadatos de paginación como `totalCount` y `totalPages`, lo cual es esencial para construir componentes de paginación en la interfaz de usuario.
 * 3. **Seguridad a Nivel de Fila (RLS):** Aunque este archivo define el acceso a los datos, la seguridad real debe ser impuesta a nivel de base de datos con Políticas de Seguridad a Nivel de Fila (RLS) en Supabase. Se debe asegurar que una política en la tabla `sites` permita la lectura solo si `auth.uid()` es un miembro del `workspace_id` asociado, previniendo cualquier posible fuga de datos.
1.  **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`.
2.  **Paginación:** Refactorizar `getAllSites` y `getSitesByWorkspaceId` para que acepten argumentos de paginación.
3.  **Seguridad a Nivel de Aplicación:** Aunque las RLS protegen los datos en la BD, las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain` para reducir la carga sobre la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Aplicación:** Las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`, ya que será llamada en cada petición a un subdominio. Esto reducirá drásticamente la carga de la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Aplicación:** Aunque RLS protege los datos, las funciones de acceso a datos podrían tomar el `workspaceId` activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad.
 * 1. **Capa de Caché:** Implementar una caché (ej. Redis o la caché de Next.js) para `getSiteDataBySubdomain`, ya que será llamada en cada petición a un subdominio. Esto reducirá drásticamente la carga de la base de datos.
 * 2. **Paginación:** Refactorizar `getAllSites` para que acepte argumentos de `page` y `pageSize` y use los métodos `.range()` de Supabase para escalar a miles de sitios.
 * 3. **Seguridad a Nivel de Workspace:** Aunque RLS protege los datos, las funciones de acceso a datos podrían tomar el ID del workspace activo de la sesión del usuario en lugar de recibirlo como argumento, para una capa extra de seguridad a nivel de aplicación.
 */
