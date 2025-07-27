/* Ruta: lib/data/sites.ts */

"use server";

import { type Database } from "@/lib/database.types";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { unstable_cache as cache, revalidateTag } from "next/cache";

/**
 * @file sites.ts
 * @description Capa de Acceso a Datos para la entidad 'sites'.
 * REFACTORIZACIÓN ARQUITECTÓNICA: Se ha unificado la lógica de búsqueda de sitios
 * para soportar tanto subdominios como futuros dominios personalizados a través de
 * una función `getSiteDataByHost`. Se ha añadido la directiva '"use server"' para
 * resolver advertencias de compilación en Vercel, forzando la ejecución en el
 * runtime de Node.js y garantizando la compatibilidad.
 *
 * @author Metashark
 * @version 4.1.0 (Unified Host Resolution & Build Fix)
 */
export type Site = Database["public"]["Tables"]["sites"]["Row"];

/**
 * @description Obtiene los datos de un sitio directamente desde la base de datos.
 * Esta función base está diseñada para ser envuelta por capas de caché.
 * @param {object} params - Los parámetros para identificar el sitio.
 * @param {string} [params.subdomain] - El subdominio a buscar.
 * @param {string} [params.customDomain] - El dominio personalizado a buscar.
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
async function fetchSiteFromDB({
  subdomain,
  customDomain,
}: {
  subdomain?: string;
  customDomain?: string;
}): Promise<Site | null> {
  const supabase = createClient();
  let query = supabase.from("sites").select("*");

  if (subdomain) {
    query = query.eq("subdomain", subdomain);
  } else if (customDomain) {
    // Esta parte está preparada para cuando se añada la columna `custom_domain`.
    query = query.eq("custom_domain", customDomain);
  } else {
    // Si no se proporciona un identificador, no se puede buscar.
    return null;
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 es 'not found', lo cual es un resultado esperado.
    logger.error(
      `Error en DB al obtener sitio por ${subdomain || customDomain}:`,
      error
    );
    return null;
  }
  return data;
}

/**
 * @description Obtiene los datos de un sitio a partir de un host (subdominio o dominio personalizado),
 * utilizando la caché de datos de Next.js para un rendimiento óptimo.
 * @param {string} host - El host a buscar (ej. 'demo' o 'www.cliente.com').
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataByHost(host: string): Promise<Site | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  const isSubdomain = !sanitizedHost.includes(".");

  return await cache(
    async () => {
      const query = isSubdomain
        ? { subdomain: sanitizedHost }
        : { customDomain: sanitizedHost };
      return fetchSiteFromDB(query);
    },
    [`site-data-host-${sanitizedHost}`], // Clave de caché única por host.
    {
      revalidate: 900, // Revalida como máximo cada 15 minutos.
      tags: [`sites:host:${sanitizedHost}`], // Etiqueta para revalidación bajo demanda.
    }
  )();
}

/**
 * @deprecated Utilizar `getSiteDataByHost` en su lugar para una arquitectura más flexible.
 * @description Obtiene los datos de un sitio específico a partir de su subdominio.
 * @param {string} subdomain - El subdominio a buscar.
 * @returns {Promise<Site | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataBySubdomain(
  subdomain: string
): Promise<Site | null> {
  return getSiteDataByHost(subdomain);
}

/**
 * @description Obtiene una lista paginada de todos los sitios de la plataforma.
 * @param {object} options - Opciones de paginación.
 * @param {number} [options.page=1] - El número de página a obtener.
 * @param {number} [options.limit=10] - El número de sitios por página.
 * @returns {Promise<{ sites: Site[]; totalCount: number }>} Una lista de sitios y el conteo total.
 */
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

/**
 * @description Obtiene una lista paginada de sitios que pertenecen a un workspace específico.
 * @param {string} workspaceId - El ID del workspace.
 * @param {object} options - Opciones de paginación.
 * @param {number} [options.page=1] - El número de página a obtener.
 * @param {number} [options.limit=10] - El número de sitios por página.
 * @returns {Promise<{ sites: Site[]; totalCount: number }>} Una lista de los sitios del workspace.
 */
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

/**
 * @description Invalida la caché para un host específico. Debe llamarse después de
 * cualquier actualización o eliminación de un sitio para asegurar que los datos se refresquen.
 * @param {string} host - El subdominio o dominio personalizado cuya caché se debe limpiar.
 */
export async function revalidateSiteDataByHostCache(host: string) {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  revalidateTag(`sites:host:${sanitizedHost}`);
  logger.info(`Caché para el host '${sanitizedHost}' invalidada.`);
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Caché Distribuida en el Borde (Edge Caching): Para una latencia aún más baja en el middleware, la lógica de caché puede ser aumentada con una caché en el borde como Vercel KV o Upstash Redis. La función `getSiteDataByHost` primero intentaría leer de la caché del borde y, si falla, recurriría a la caché de datos de Next.js y a la base de datos, escribiendo el resultado en ambas cachés.
 * 2. Políticas de Seguridad (RLS) Robustas: La seguridad de los datos debe ser impuesta en la capa de base de datos con Políticas de Seguridad a Nivel de Fila (RLS) en Supabase. Se debe asegurar que una política en la tabla `sites` restrinja las operaciones de escritura (insert, update, delete) solo a los usuarios que son miembros del `workspace_id` asociado.
 * 3. Abstracción del Cliente Supabase: A medida que la capa de datos crezca con más entidades (campañas, suscriptores, etc.), se podría crear una clase o un servicio de base de datos que encapsule el cliente de Supabase. Esto facilitaría las pruebas unitarias (mocking) y la gestión de dependencias a través de inyección de dependencias.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Caché Distribuida en el Borde (Edge Caching): Para una latencia mínima, la lógica de caché de `getSiteDataByHost` debería migrarse a una solución de caché en el borde como Vercel KV o Upstash Redis, que puede ser accedida directamente desde el middleware con un rendimiento superior.
 * 2. Políticas de Seguridad (RLS) Robustas: La seguridad real debe ser impuesta con Políticas de Seguridad a Nivel de Fila (RLS) en Supabase. Asegurar que una política en la tabla `sites` permita la lectura pública pero restrinja la escritura solo a los miembros del `workspace_id` asociado es crucial.
 * 3. Abstracción del Cliente Supabase: A medida que la capa de datos crezca, se podría crear una clase o un servicio de base de datos que encapsule el cliente de Supabase, facilitando las pruebas unitarias y la gestión de dependencias a través de inyección de dependencias.
 */
