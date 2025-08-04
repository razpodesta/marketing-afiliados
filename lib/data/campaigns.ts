// lib/data/campaigns.ts
/**
 * @file lib/data/campaigns.ts
 * @description Aparato de datos para 'campaigns'. Ha sido optimizado con caché
 *              de servidor (`unstable_cache`) y preparado para una futura
 *              optimización con función RPC.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 2.1.0 (Server-Side Caching Implementation)
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
  { page, limit }: { page: number; limit: number }
): Promise<{ campaigns: CampaignMetadata[]; totalCount: number }> {
  return cache(
    async () => {
      logger.info(
        `[Cache MISS] Cargando metadatos de campañas desde DB para sitio ${siteId}, pág ${page}.`
      );
      const supabase = createClient();
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("campaigns")
        .select(
          "id, site_id, name, slug, created_at, updated_at, affiliate_url",
          {
            count: "exact",
          }
        )
        .eq("site_id", siteId)
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
    [`campaigns-meta-${siteId}-p${page}`],
    { tags: [`campaigns:${siteId}`] }
  )();
}

export async function getRecentCampaignsByWorkspaceId(
  workspaceId: string,
  limit: number = 4
): Promise<Tables<"campaigns">[]> {
  // NOTA: La implementación RPC se omite por ahora para mantener la simplicidad
  // hasta que el script SQL sea parte del flujo de migración.
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

      if (sitesError) {
        logger.error(
          `Error al obtener sitios para el workspace ${workspaceId}:`,
          sitesError
        );
        return [];
      }
      if (!sites || sites.length === 0) {
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
  // Esta función es de alta especificidad y no se beneficia tanto del cacheo
  // a nivel de datos, ya que su lógica de permisos la hace dinámica.
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
 * @subsection Mejoras Implementadas
 * 1. **Cacheo de Servidor**: ((Implementada)) Las funciones de lectura ahora usan `unstable_cache`.
 * 2. **Optimización RPC Futura**: ((Planificada)) `getRecentCampaignsByWorkspaceId` está preparada para ser reemplazada por una función RPC.
 */
// lib/data/campaigns.ts
