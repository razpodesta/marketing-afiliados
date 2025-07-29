// lib/data/admin.ts
"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import type { SiteWithCampaignsCount } from "./sites";

/**
 * @file admin.ts
 * @description Aparato de datos para consultas de administrador que requieren privilegios elevados.
 * @author L.I.A Legacy
 * @version 1.0.0
 */

/**
 * @description Obtiene todos los sitios de la plataforma de forma paginada.
 *              Utiliza el cliente de administrador para eludir las políticas de RLS.
 * @param {object} options - Opciones de paginación.
 * @returns {Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }>}
 * @throws {Error} Si la consulta a la base de datos falla.
 */
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
    .select(
      `
      *,
      campaigns (
        count
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`[DataLayer:Admin] Error al obtener todos los sitios:`, error);
    throw new Error("No se pudieron obtener los datos de los sitios.");
  }

  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}
