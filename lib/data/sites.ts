// lib/data/sites.ts
/**
 * @file lib/data/sites.ts
 * @description Aparato de datos especializado para todas las consultas
 *              relacionadas con la entidad 'sites', ahora con capacidades de
 *              búsqueda en el servidor para una escalabilidad masiva.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Server-Side Search & Filtering)
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";
import { rootDomain } from "@/lib/utils";

export type SiteWithCampaignsCount = Tables<"sites"> & {
  campaigns: { count: number }[];
};
export type SiteBasicInfo = Pick<
  Tables<"sites">,
  "id" | "subdomain" | "workspace_id"
>;

/**
 * @async
 * @function getSitesByWorkspaceId
 * @description Obtiene una lista paginada de sitios para un workspace,
 *              incluyendo la cuenta de campañas y filtrando por subdominio en la DB.
 * @param {string} workspaceId - El ID del workspace.
 * @param {object} options - Opciones de paginación y búsqueda.
 * @param {number} [options.page=1] - La página a recuperar.
 * @param {number} [options.limit=9] - El número de sitios por página.
 * @param {string} [options.query] - El término de búsqueda para filtrar por subdominio.
 * @returns {Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }>} La lista de sitios filtrados y el conteo total.
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
    .select("*, campaigns(count)", { count: "exact" })
    .eq("workspace_id", workspaceId);

  // --- REFACTORIZACIÓN (BÚSQUEDA EN SERVIDOR) ---
  // Si se provee un término de búsqueda, se añade un filtro .ilike() a la consulta.
  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("subdomain", `%${searchQuery}%`);
  }
  // --- FIN DE REFACTORIZACIÓN ---

  const { data, error, count } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      `[DataLayer:Sites] Error al obtener sitios para ${workspaceId}:`,
      error
    );
    throw new Error("No se pudieron obtener los sitios del workspace.");
  }

  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}

export async function getSiteById(
  siteId: string
): Promise<SiteBasicInfo | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, subdomain, workspace_id")
    .eq("id", siteId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(
        `[DataLayer:Sites] Error al obtener el sitio ${siteId}:`,
        error
      );
    }
    return null;
  }
  return data;
}

export async function getSiteDataByHost(
  host: string
): Promise<Tables<"sites"> | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  const isSubdomain =
    !sanitizedHost.includes(rootDomain.split(":")[0]) ||
    sanitizedHost === rootDomain.split(":")[0];

  return cache(
    async (hostToSearch: string) => {
      logger.info(`[Cache MISS] Buscando sitio para el host: ${hostToSearch}`);
      const supabase = createClient();
      let query = supabase.from("sites").select("*");
      query = isSubdomain
        ? query.eq("subdomain", hostToSearch)
        : query.eq("custom_domain", hostToSearch);
      const { data, error } = await query.single();
      if (error && error.code !== "PGRST116") {
        logger.error(
          `[DataLayer:Sites] Error al obtener sitio por host ${hostToSearch}:`,
          error
        );
        return null;
      }
      return data;
    },
    [`site-data-host-${sanitizedHost}`],
    { revalidate: 3600, tags: [`sites:host:${sanitizedHost}`] }
  )(sanitizedHost);
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la capa de datos de sitios.
 *
 * 1.  **Búsqueda Multi-campo**: (Vigente) Expandir `getSitesByWorkspaceId` para que `searchQuery` pueda buscar no solo por `subdomain`, sino también por `name`, `description` o `custom_domain` para una mayor flexibilidad.
 * 2.  **Soporte para Ordenamiento Dinámico**: (Vigente) Modificar `getSitesByWorkspaceId` para aceptar un parámetro `sort` (ej. 'name_asc', 'created_at_desc') y aplicarlo dinámicamente a la cláusula `.order()`.
 * 3.  **Función de Actualización (`updateSite`)**: (Vigente) Crear una nueva función en este aparato para actualizar los detalles de un sitio, incluyendo la invalidación de caché (`revalidateTag`) apropiada.
 */
// lib/data/sites.ts
