// lib/data/sites.ts
/**
 * @file sites.ts
 * @description Aparato de datos especializado para todas las consultas
 *              relacionadas con la entidad 'sites'.
 * @author L.I.A Legacy
 * @version 3.0.0 (Type Contract Fortification)
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";
import { unstable_cache as cache } from "next/cache";

/**
 * @typedef {object} SiteWithCampaignsCount
 * @description Este tipo define el contrato de datos para la UI del dashboard.
 *              Al exportarlo, aseguramos que los componentes cliente como `SiteCard` y `SitesGrid`
 *              esperen exactamente esta forma, eliminando errores de tipo 'never'.
 * @property {Array<{count: number}>} campaigns - Supabase devuelve el conteo de una relación como un array de objetos.
 */
export type SiteWithCampaignsCount = Tables<"sites"> & {
  campaigns: { count: number }[];
};

/**
 * @description Obtiene una lista paginada de sitios para un workspace, incluyendo el conteo de campañas.
 * @param {string} workspaceId - El ID del workspace.
 * @param {object} options - Opciones de paginación y búsqueda.
 * @returns {Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }>} La lista de sitios y el conteo total.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getSitesByWorkspaceId(
  workspaceId: string,
  {
    page = 1,
    limit = 9,
    query: searchQuery = "",
  }: { page?: number; limit?: number; query?: string }
): Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("sites")
    .select(
      `
      *,
      campaigns (
        count
      )
    `,
      { count: "exact" }
    )
    .eq("workspace_id", workspaceId);

  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("subdomain", `%${searchQuery}%`);
  }

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      `Error al obtener sitios para el workspace ${workspaceId}:`,
      error
    );
    throw new Error("No se pudieron obtener los sitios del workspace.");
  }

  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}

/**
 * @description Obtiene los datos de un único sitio a partir de su ID.
 *              Incluye información del workspace para validaciones de permisos.
 * @param {string} siteId - El ID del sitio a buscar.
 * @returns {Promise<Tables<'sites'> | null>} El objeto del sitio o null si no se encuentra.
 */
export async function getSiteById(
  siteId: string
): Promise<Tables<"sites"> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, subdomain, workspace_id")
    .eq("id", siteId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(`Error al obtener el sitio con ID ${siteId}:`, error);
    }
    return null;
  }
  return data;
}

/**
 * @description Obtiene los datos públicos de un sitio a partir de un host.
 *              Esta función está optimizada con caché y es ideal para ser usada
 *              en el middleware donde el rendimiento es crítico.
 * @param {string} host - El host a buscar (puede ser un subdominio o un dominio personalizado).
 * @returns {Promise<Tables<"sites"> | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataByHost(
  host: string
): Promise<Tables<"sites"> | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  const isSubdomain = !sanitizedHost.includes(".");

  const cachedSiteLookup = cache(
    async (hostToSearch: string) => {
      logger.info(`[Cache] MISS: Buscando sitio para el host: ${hostToSearch}`);
      const supabase = createClient();
      const columnToFilter = isSubdomain ? "subdomain" : "custom_domain";

      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq(columnToFilter, hostToSearch)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(
          `Error en DB al obtener sitio por host ${hostToSearch}:`,
          error
        );
        return null;
      }
      return data;
    },
    [`site-data-host-${sanitizedHost}`],
    { revalidate: 3600, tags: [`sites:host:${sanitizedHost}`] }
  );

  return await cachedSiteLookup(sanitizedHost);
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda Multi-campo: Extender `getSitesByWorkspaceId` para que `searchQuery` pueda buscar no solo por `subdomain`, sino también por `custom_domain` o incluso por nombres de campañas asociadas para una mayor flexibilidad en la UI.
 * 2. Soporte para Ordenamiento Dinámico: Modificar `getSitesByWorkspaceId` para que acepte un parámetro `sort` (ej: 'name_asc', 'created_at_desc') y lo aplique dinámicamente a la cláusula `.order()` de la consulta de Supabase.
 * 3. Función de Actualización (`updateSite`): Crear una nueva función en este aparato para actualizar los detalles de un sitio (cambiar icono, dominio personalizado, etc.), incluyendo la invalidación de caché (`revalidateTag`) apropiada para mantener los datos consistentes.
 */
/**
 * @description Este aparato es la única fuente de verdad para interactuar con la entidad `sites`.
 *              Se espera que encapsule toda la lógica de consulta, incluyendo paginación,
 *              búsqueda y cacheo, devolviendo siempre datos que se adhieren a los
 *              tipos fuertemente definidos como `SiteWithCampaignsCount`.
 * @propose_new_improvements
 * 1. **Búsqueda Multi-campo**: Extender `getSitesByWorkspaceId` para que `searchQuery` pueda buscar no solo por `subdomain`, sino también por `custom_domain` o incluso por nombres de campañas asociadas.
 * 2. **Soporte para Ordenamiento Dinámico**: Modificar `getSitesByWorkspaceId` para que acepte un parámetro `sort` (ej: 'name_asc', 'created_at_desc') y lo aplique dinámicamente a la cláusula `.order()` de la consulta.
 * 3. **Función de Actualización (`updateSiteAction`)**: Crear una nueva función para actualizar un sitio (cambiar icono, dominio personalizado, etc.), incluyendo la invalidación de caché (`revalidateTag`) apropiada.
 */
// lib/data/sites.ts
/*
Análisis de Impacto]:
Estabilidad de Tipos: El nuevo tipo SiteWithCampaignsCount y la consulta explícita resolverán la cascada de errores de tipo never en los componentes cliente (SitesGrid, SiteCard).
Especialización: getSitesByWorkspaceId está diseñado para el dashboard (datos privados), mientras que getSiteDataByHost está optimizado con caché para el middleware (datos públicos). Esta separación es arquitectónicamente sólida.
Mantenibilidad: Toda la lógica de consulta de sitios está ahora en un único lugar, facilitando futuras modificaciones o depuraciones.
*/
