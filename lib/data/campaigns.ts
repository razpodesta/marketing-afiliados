// lib/data/campaigns.ts
/**
 * @file lib/data/campaigns.ts
 * @description Aparato de datos para 'campaigns'. Ha sido optimizado para
 *              soportar búsqueda en servidor y utiliza caché (`unstable_cache`)
 *              para un rendimiento de élite.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 3.0.0 (Server-Side Search & Caching)
 */
"use server";

import { unstable_cache as cache } from "next/cache";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

import { hasWorkspacePermission } from "./permissions";

export type CampaignMetadata = Omit<Tables<"campaigns">, "content">;
export type CampaignWithContent = Tables<"campaigns"> & {
  sites: { workspace_id: string } | null;
};

export async function getCampaignsMetadataBySiteId(
  siteId: string,
  { page, limit, query }: { page: number; limit: number; query?: string }
): Promise<{ campaigns: CampaignMetadata[]; totalCount: number }> {
  const cacheKey = `campaigns-meta-${siteId}-p${page}-q${query || ""}`;
  const cacheTags = [`campaigns:${siteId}`, `campaigns:${siteId}:p${page}`];

  return cache(
    async () => {
      logger.info(`[Cache MISS] Cargando metadatos para: ${cacheKey}`);
      const supabase = createClient();
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let queryBuilder = supabase
        .from("campaigns")
        .select(
          "id, site_id, name, slug, created_at, updated_at, affiliate_url",
          { count: "exact" }
        )
        .eq("site_id", siteId);

      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,slug.ilike.%${query}%`
        );
      }

      const { data, error, count } = await queryBuilder
        .order("updated_at", { ascending: false, nullsFirst: false })
        .range(from, to);

      if (error) {
        logger.error(
          `Error al obtener campañas para el sitio ${siteId}:`,
          error
        );
        return { campaigns: [], totalCount: 0 };
      }
      return { campaigns: data, totalCount: count || 0 };
    },
    [cacheKey],
    { tags: cacheTags }
  )();
}

export async function getRecentCampaignsByWorkspaceId(
  workspaceId: string,
  limit: number = 4
): Promise<Tables<"campaigns">[]> {
  return cache(
    async () => {
      logger.info(
        `[Cache MISS] Cargando campañas recientes para workspace ${workspaceId}.`
      );
      const supabase = createClient();

      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select("id")
        .eq("workspace_id", workspaceId);

      if (sitesError || !sites || sites.length === 0) {
        if (sitesError)
          logger.error(
            `Error al obtener sitios para el workspace ${workspaceId}:`,
            sitesError
          );
        return [];
      }

      const siteIds = sites.map((s) => s.id);

      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .in("site_id", siteIds)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (campaignsError) {
        logger.error(
          `Error al obtener campañas recientes para el workspace ${workspaceId}:`,
          campaignsError
        );
        return [];
      }

      return campaigns || [];
    },
    [`recent-campaigns-${workspaceId}`],
    { tags: [`workspaces:${workspaceId}:recent-campaigns`] }
  )();
}

export async function getCampaignContentById(
  campaignId: string,
  userId: string
): Promise<CampaignWithContent | null> {
  const supabase = createClient();
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(`*, sites (workspace_id)`)
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    if (error && error.code !== "PGRST116") {
      logger.error(`Error al obtener la campaña ${campaignId}:`, error);
    }
    return null;
  }

  const workspaceId = campaign.sites?.workspace_id;
  if (!workspaceId) {
    logger.error(
      `INCONSISTENCIA: Campaña ${campaignId} sin workspace asociado.`
    );
    return null;
  }

  const isAuthorized = await hasWorkspacePermission(userId, workspaceId, [
    "owner",
    "admin",
    "member",
  ]);

  if (!isAuthorized) {
    logger.warn(
      `SEGURIDAD: Usuario ${userId} intentó acceder a la campaña ${campaignId} sin permisos.`
    );
    return null;
  }

  return campaign as CampaignWithContent;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Búsqueda en Servidor**: ((Implementada)) La función `getCampaignsMetadataBySiteId` ahora acepta un parámetro `query` y construye una consulta `ilike` para un filtrado eficiente en la base de datos.
 * 2. **Cacheo Dinámico**: ((Implementada)) La clave de caché para `getCampaignsMetadataBySiteId` ahora incluye la `query`, asegurando que diferentes búsquedas se cacheen por separado.
 *
 * @subsection Melhorias Futuras
 * 1. **Función RPC `get_recent_campaigns`**: ((Vigente)) Reemplazar la lógica de `getRecentCampaignsByWorkspaceId` con una única llamada a una función de base de datos optimizada para reducir la latencia de red.
 * 2. **Observabilidad de Rendimiento**: ((Vigente)) Añadir logging de `trace` con `performance.now()` para medir la duración de las consultas a la base de datos.
 */
// lib/data/campaigns.ts
