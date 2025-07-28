// Ruta: lib/data/campaigns.ts
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

/**
 * @file campaigns.ts
 * @description Capa de Acceso a Datos para la entidad 'campaigns'.
 *              Centraliza todas las consultas a la base de datos relacionadas
 *              con las campañas para mejorar la modularidad y reutilización.
 *
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Creation)
 */

/**
 * @description Obtiene una lista paginada de campañas para un sitio específico.
 * @param {string} siteId - El UUID del sitio.
 * @param {object} options - Opciones de paginación.
 * @param {number} options.page - El número de página a obtener.
 * @param {number} options.limit - El número de campañas por página.
 * @returns {Promise<{campaigns: Tables<'campaigns'>[], totalCount: number}>}
 */
export async function getPaginatedCampaignsBySiteId(
  siteId: string,
  { page, limit }: { page: number; limit: number }
): Promise<{ campaigns: Tables<"campaigns">[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("campaigns")
    .select("id, name, created_at, updated_at, slug", { count: "exact" })
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`Error al obtener campañas para el sitio ${siteId}:`, error);
    throw new Error("No se pudieron obtener las campañas.");
  }

  // Se asume que la consulta devuelve el tipo correcto, se puede añadir validación con Zod a futuro.
  return { campaigns: data as Tables<"campaigns">[], totalCount: count || 0 };
}
