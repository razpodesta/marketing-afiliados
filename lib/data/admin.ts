// lib/data/admin.ts
/**
 * @file admin.ts
 * @description Aparato de datos para consultas de administrador. Ha sido
 *              expandido para incluir la lógica de visualización de todas
 *              las campañas de la plataforma.
 * @author L.I.A Legacy
 * @version 3.0.0 (Campaign Viewer Logic)
 */
"use server";

import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

import type { SiteWithCampaignsCount } from "./sites";

export type UserProfileWithEmail = Tables<"user_profiles_with_email">;

// --- INICIO DE NUEVO APARATO ---
export type CampaignWithSiteInfo = Tables<"campaigns"> & {
  sites: { subdomain: string | null } | null;
};

/**
 * @async
 * @function getAllCampaignsWithSiteInfo
 * @description Obtiene todas las campañas de la plataforma, incluyendo información
 *              del sitio al que pertenecen. Utiliza el cliente de administrador.
 * @returns {Promise<CampaignWithSiteInfo[]>}
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getAllCampaignsWithSiteInfo(): Promise<
  CampaignWithSiteInfo[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      sites (
        subdomain
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      `[DataLayer:Admin] Error al obtener todas las campañas:`,
      error
    );
    throw new Error("No se pudieron obtener los datos de las campañas.");
  }

  return (data as CampaignWithSiteInfo[]) || [];
}
// --- FIN DE NUEVO APARATO ---

export async function getPaginatedUsersWithRoles({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}): Promise<{ profiles: UserProfileWithEmail[]; totalCount: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: profiles,
    error,
    count,
  } = await supabase
    .from("user_profiles_with_email")
    .select("*", { count: "exact" })
    .range(from, to);

  if (error) {
    logger.error(
      `[DataLayer:Admin] Error al obtener perfiles de usuario:`,
      error
    );
    throw new Error("No se pudieron obtener los perfiles de usuario.");
  }

  return { profiles: profiles || [], totalCount: count || 0 };
}

export async function getAllSites({
  page = 1,
  limit = 12,
}: {
  page?: number;
  limit?: number;
}): Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("sites")
    .select(`*, campaigns (count)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`[DataLayer:Admin] Error al obtener todos los sitios:`, error);
    throw new Error("No se pudieron obtener los datos de los sitios.");
  }

  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Paginación para `getAllCampaigns`**: ((Vigente)) Añadir paginación a esta función para manejar un gran número de campañas.
 *
 * @subsection Mejoras Implementadas
 * 1. **Lógica del Visor de Campañas**: ((Implementada)) Se ha añadido la función `getAllCampaignsWithSiteInfo`, centralizando esta consulta.
 */
// lib/data/admin.ts
