// Ruta: lib/data/campaigns.ts (REFACTORIZADO/NUEVO)
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

import { hasWorkspacePermission } from "./permissions";

/**
 * @file campaigns.ts
 * @description Aparato de datos especializado para todas las consultas
 *              relacionadas con la entidad 'campaigns'.
 * @author L.I.A Legacy
 * @version 2.0.0
 */

// Tipo para la lista de campañas en el dashboard (sin el 'content').
export type CampaignMetadata = Omit<Tables<"campaigns">, "content">;

// Tipo para la campaña completa, incluyendo su contenido y el workspaceId para validación.
export type CampaignWithContent = Tables<"campaigns"> & {
  sites: { workspace_id: string } | null;
};

/**
 * @description Obtiene una lista paginada de metadatos de campañas para un sitio específico.
 *              Optimizado para no devolver el campo 'content' que puede ser pesado.
 * @param {string} siteId - El UUID del sitio.
 * @param {object} options - Opciones de paginación.
 * @returns {Promise<{campaigns: CampaignMetadata[], totalCount: number}>}
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getPaginatedCampaignsBySiteId(
  siteId: string,
  { page, limit }: { page: number; limit: number }
): Promise<{ campaigns: CampaignMetadata[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // CONSULTA OPTIMIZADA: Selecciona explícitamente todos los campos EXCEPTO 'content'.
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
 * @description Obtiene el contenido completo de una campaña específica, verificando
 *              primero si el usuario tiene permisos para acceder a ella.
 * @param {string} campaignId - El UUID de la campaña.
 * @param {string} userId - El UUID del usuario que solicita los datos.
 * @returns {Promise<CampaignWithContent | null>} La campaña completa o null si no se encuentra o no hay permisos.
 */
export async function getCampaignContentById(
  campaignId: string,
  userId: string
): Promise<CampaignWithContent | null> {
  const supabase = createClient();

  // CONSULTA DE SEGURIDAD Y DATOS:
  // Hacemos un join implícito a través de 'sites' para obtener el 'workspace_id'.
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      sites (
        workspace_id
      )
    `
    )
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    if (error && error.code !== "PGRST116") {
      logger.error(`Error al obtener la campaña ${campaignId}:`, error);
    }
    return null; // Campaña no encontrada.
  }

  const workspaceId = campaign.sites?.workspace_id;

  if (!workspaceId) {
    logger.error(
      `La campaña ${campaignId} no está asociada a ningún workspace.`
    );
    return null; // Dato huérfano, inconsistencia de datos.
  }

  // CONTROL DE ACCESO: Usamos el aparato de permisos.
  const isAuthorized = await hasWorkspacePermission(userId, workspaceId, [
    "owner",
    "admin",
    "member",
  ]);

  if (!isAuthorized) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: Usuario ${userId} intentó acceder al contenido de la campaña ${campaignId} sin permisos.`
    );
    return null; // No autorizado.
  }

  return campaign as CampaignWithContent;
}

/*
[Análisis de Impacto]:
Rendimiento: La página de listado de campañas (/dashboard/sites/[siteId]/campaigns) cargará significativamente más rápido al no tener que transferir el content JSON de cada campaña.
Seguridad: La función getCampaignContentById ahora encapsula la lógica de autorización. El Server Component de la página del constructor (/builder/[campaignId]/page.tsx) se simplificará, ya que su única responsabilidad será llamar a esta función y confiar en que la verificación de permisos ya ha sido realizada.
Claridad: La existencia de dos funciones distintas (getPaginated... vs get...Content) hace que la intención de cada consulta sea explícita y fácil de entender para futuros desarrolladores.
*/
