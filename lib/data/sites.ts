/* Ruta: lib/data/sites.ts */

"use server";

import { type Database } from "@/lib/database.types";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { unstable_cache as cache, revalidateTag } from "next/cache";

/**
 * @file sites.ts
 * @description Capa de Acceso a Datos para la entidad 'sites'.
 * REFACTORIZACIÓN ARQUITECTÓNICA: Se ha añadido la función `getSiteDataByHost`
 * para soportar la resolución de sitios tanto por subdominio como por dominio
 * personalizado. Todas las búsquedas de host están ahora cacheadas para un
 * rendimiento máximo en el middleware.
 *
 * @author Metashark
 * @version 4.0.0 (Custom Domain Support Refactor)
 */
export type Site = Database["public"]["Tables"]["sites"]["Row"];

/**
 * @description Obtiene los datos de un sitio a partir de un host (subdominio o dominio personalizado).
 * Esta función está optimizada con una caché de alto rendimiento para ser usada en el middleware.
 * @param {string} host - El host a buscar (ej. 'demo' o 'www.cliente.com').
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataByHost(host: string): Promise<Site | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");

  return await cache(
    async () => {
      const supabase = createClient();
      // Intenta encontrar por subdominio O por dominio personalizado en una sola consulta.
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .or(`subdomain.eq.${sanitizedHost},custom_domain.eq.${sanitizedHost}`)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `Error en DB al obtener sitio por host ${sanitizedHost}:`,
          error
        );
        return null;
      }
      return data;
    },
    [`site-data-host-${sanitizedHost}`],
    {
      revalidate: 900,
      tags: [`sites:host:${sanitizedHost}`],
    }
  )();
}

/**
 * @description Invalida la caché para un host específico (subdominio o dominio personalizado).
 * @param {string} host - El host cuya caché se debe limpiar.
 */
export async function revalidateSiteDataByHostCache(host: string) {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  revalidateTag(`sites:host:${sanitizedHost}`);
  logger.info(`Caché para el host '${sanitizedHost}' invalidada.`);
}

// --- FUNCIONES LEGACY (se mantienen por compatibilidad pero se marcan como deprecated) ---

/**
 * @deprecated Utilizar `getSiteDataByHost` en su lugar para soportar dominios personalizados.
 * @description Obtiene los datos de un sitio específico a partir de su subdominio.
 * @param {string} subdomain - El subdominio a buscar.
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataBySubdomain(
  subdomain: string
): Promise<Site | null> {
  return getSiteDataByHost(subdomain);
}

// --- FUNCIONES DE GESTIÓN (Paginadas, sin cambios) ---

export async function getAllSites({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{ sites: Site[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("sites")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error("Error al obtener todos los sitios:", error);
    return { sites: [], totalCount: 0 };
  }
  return { sites: data, totalCount: count || 0 };
}

export async function getSitesByWorkspaceId(
  workspaceId: string,
  { page = 1, limit = 10 }: { page?: number; limit?: number }
): Promise<{ sites: Site[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("sites")
    .select("*", { count: "exact" })
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      `Error al obtener sitios para el workspace ${workspaceId}:`,
      error
    );
    return { sites: [], totalCount: 0 };
  }
  return { sites: data, totalCount: count || 0 };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Caché Distribuida en el Borde (Edge Caching): Para una latencia mínima, la lógica de caché de `getSiteDataByHost` debería migrarse a una solución de caché en el borde como Vercel KV o Upstash Redis, que puede ser accedida directamente desde el middleware con un rendimiento superior.
 * 2. Políticas de Seguridad (RLS) Robustas: La seguridad real debe ser impuesta con Políticas de Seguridad a Nivel de Fila (RLS) en Supabase. Asegurar que una política en la tabla `sites` permita la lectura pública pero restrinja la escritura solo a los miembros del `workspace_id` asociado es crucial.
 * 3. Abstracción del Cliente Supabase: A medida que la capa de datos crezca, se podría crear una clase o un servicio de base de datos que encapsule el cliente de Supabase, facilitando las pruebas unitarias y la gestión de dependencias a través de inyección de dependencias.
 */
