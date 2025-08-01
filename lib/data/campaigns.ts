// lib/data/campaigns.ts
/**
 * @file lib/data/campaigns.ts
 * @description Aparato de datos canónico y especializado para todas las consultas
 *              relacionadas con la entidad 'campaigns'. Esta es la ÚNICA fuente
 *              de verdad para acceder a los datos de campañas, garantizando
 *              seguridad, rendimiento y consistencia arquitectónica.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Canonical Data Layer Abstraction)
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

import { hasWorkspacePermission } from "./permissions";

/**
 * @typedef {Omit<Tables<"campaigns">, "content">} CampaignMetadata
 * @description Representa los metadatos de una campaña, excluyendo el campo `content`
 *              que puede ser un JSON pesado. Optimizado para listas y tablas.
 */
export type CampaignMetadata = Omit<Tables<"campaigns">, "content">;

/**
 * @typedef {Tables<"campaigns"> & { sites: { workspace_id: string } | null }} CampaignWithContent
 * @description Representa una campaña completa, incluyendo su contenido y la información
 *              del workspace para validaciones de seguridad.
 */
export type CampaignWithContent = Tables<"campaigns"> & {
  sites: { workspace_id: string } | null;
};

/**
 * @async
 * @function getCampaignsMetadataBySiteId
 * @description Obtiene una lista paginada de metadatos de campañas para un sitio específico.
 *              Esta función está optimizada para el rendimiento al no devolver el campo `content`.
 * @param {string} siteId - El UUID del sitio.
 * @param {object} options - Opciones de paginación.
 * @param {number} options.page - El número de página a obtener.
 * @param {number} options.limit - El número de campañas por página.
 * @returns {Promise<{campaigns: CampaignMetadata[], totalCount: number}>} Una promesa que resuelve a la lista de metadatos de campaña y el conteo total.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getCampaignsMetadataBySiteId(
  siteId: string,
  { page, limit }: { page: number; limit: number }
): Promise<{ campaigns: CampaignMetadata[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("campaigns")
    .select("id, site_id, name, slug, created_at, updated_at", {
      count: "exact",
    })
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    logger.error(`Error al obtener campañas para el sitio ${siteId}:`, error);
    throw new Error("No se pudieron obtener las campañas.");
  }

  return { campaigns: data, totalCount: count || 0 };
}

/**
 * @async
 * @function getRecentCampaignsByWorkspaceId
 * @description Obtiene las campañas más recientemente actualizadas dentro de un workspace.
 * @param {string} workspaceId - El UUID del workspace.
 * @param {number} [limit=4] - El número máximo de campañas a devolver.
 * @returns {Promise<Tables<"campaigns">[]>} Una promesa que resuelve a una lista de las campañas más recientes.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getRecentCampaignsByWorkspaceId(
  workspaceId: string,
  limit: number = 4
): Promise<Tables<"campaigns">[]> {
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
    throw new Error("No se pudieron obtener los sitios para el workspace.");
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
    throw new Error("No se pudieron obtener las campañas recientes.");
  }

  return campaigns || [];
}

/**
 * @async
 * @function getCampaignContentById
 * @description Obtiene el contenido completo de una campaña específica, verificando
 *              primero que el usuario tiene permisos para acceder a ella.
 * @param {string} campaignId - El UUID de la campaña.
 * @param {string} userId - El UUID del usuario que solicita los datos.
 * @returns {Promise<CampaignWithContent | null>} La campaña completa o null si no se encuentra o no hay permisos.
 */
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
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la capa de datos de campañas.
 *
 * 1.  **Cacheo de Datos con `unstable_cache`**: Ambas funciones, `getCampaignsMetadataBySiteId` y `getRecentCampaignsByWorkspaceId`, son candidatas ideales para ser cacheadas con `unstable_cache` de Next.js. Las Server Actions que modifican campañas deberán invalidar estas cachés con `revalidateTag` para mantener los datos frescos y mejorar drásticamente el rendimiento.
 * 2.  **Optimización de Consulta con RPC**: La función `getRecentCampaignsByWorkspaceId` realiza dos consultas secuenciales a la base de datos. Para un rendimiento superior, esta lógica podría ser encapsulada en una única función de base de datos PostgreSQL (RPC), reduciendo la latencia de red entre el servidor y la base de datos.
 * 3.  **Soporte para Búsqueda y Ordenamiento**: Expandir la función `getCampaignsMetadataBySiteId` para que acepte parámetros de búsqueda y ordenamiento desde los `searchParams` de la URL. La consulta de Supabase se modificaría para incluir cláusulas `.ilike()` y `.order()` dinámicas.
 */
// lib/data/campaigns.ts
