// lib/data/sites.ts
/**
 * @file sites.ts
 * @description Aparato de datos para 'sites'. Refatorado com uma lógica de
 *              detecção de host robusta para distinguir corretamente entre
 *              subdomínios e domínios personalizados.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 8.0.0 (Robust Host Detection Logic)
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
export type SiteSortOption = "created_at_desc" | "name_asc" | "name_desc";

function buildSiteSearchQuery(
  workspaceId: string,
  filters: { query?: string; sort?: SiteSortOption }
) {
  const supabase = createClient();
  let queryBuilder = supabase
    .from("sites")
    .select("*, campaigns(count)", { count: "exact" })
    .eq("workspace_id", workspaceId);

  if (filters.query) {
    queryBuilder = queryBuilder.ilike("subdomain", `%${filters.query}%`);
  }

  const sortMap: Record<
    SiteSortOption,
    { column: string; ascending: boolean }
  > = {
    created_at_desc: { column: "created_at", ascending: false },
    name_asc: { column: "name", ascending: true },
    name_desc: { column: "name", ascending: false },
  };
  const sort = sortMap[filters.sort || "created_at_desc"];
  queryBuilder = queryBuilder.order(sort.column, {
    ascending: sort.ascending,
  });

  return queryBuilder;
}

export async function getSitesByWorkspaceId(
  workspaceId: string,
  {
    page = 1,
    limit = 9,
    query: searchQuery = "",
    sort: sortOption = "created_at_desc",
  }: {
    page?: number;
    limit?: number;
    query?: string;
    sort?: SiteSortOption;
  }
): Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const queryBuilder = buildSiteSearchQuery(workspaceId, {
    query: searchQuery,
    sort: sortOption,
  });

  const { data, error, count } = await queryBuilder.range(from, to);

  if (error) {
    logger.error(
      `[DataLayer:Sites] Error al obtener sitios para ${workspaceId}:`,
      error
    );
    throw new Error("No se pudieron obtener los sitios del workspace.");
  }

  return { sites: (data as any) || [], totalCount: count || 0 };
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
  const sanitizedHost = host.toLowerCase().replace(/^www\./, "");
  const rootDomainWithoutPort = rootDomain.split(":")[0];

  // --- INÍCIO DA CORREÇÃO DE LÓGICA ---
  const isSubdomain =
    sanitizedHost.endsWith(`.${rootDomainWithoutPort}`) &&
    sanitizedHost !== rootDomainWithoutPort;
  const finalHost = isSubdomain
    ? sanitizedHost.replace(`.${rootDomainWithoutPort}`, "")
    : sanitizedHost;
  // --- FIM DA CORREÇÃO DE LÓGICA ---

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
    [`site-data-host-${finalHost}`],
    { revalidate: 3600, tags: [`sites:host:${finalHost}`] }
  )(finalHost);
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Lógica de Detecção de Host Robusta**: ((Implementada)) A lógica `isSubdomain` foi corrigida para garantir que um host que termina com o root domain seja tratado como subdomínio, resolvendo o bug.
 */
// lib/data/sites.ts
