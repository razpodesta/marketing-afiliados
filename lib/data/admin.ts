// lib/data/admin.ts
/**
 * @file admin.ts
 * @description Aparato de datos para consultas de administrador. Ha sido
 *              simplificado para depender de la inferencia de tipos automática
 *              proporcionada por el cliente de Supabase tipado.
 * @author L.I.A Legacy
 * @version 6.0.0 (Elite Test Coverage)
 * @see tests/integration/lib/data/admin.test.ts
 */
"use server";

import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/server";
import { type Tables, type Views } from "@/lib/types/database";

import type { SiteWithCampaignsCount } from "./sites";

export type UserProfilesWithEmail = Views<"user_profiles_with_email">;

export type CampaignWithSiteInfo = Tables<"campaigns"> & {
  sites: { subdomain: string | null } | null;
};

export async function getAllCampaignsWithSiteInfo(): Promise<
  CampaignWithSiteInfo[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(`*, sites (subdomain)`)
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

export async function getPaginatedUsersWithRoles({
  page = 1,
  limit = 20,
  query = "",
}: {
  page?: number;
  limit?: number;
  query?: string;
}): Promise<{ profiles: UserProfilesWithEmail[]; totalCount: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let queryBuilder = supabase
    .from("user_profiles_with_email")
    .select("*", { count: "exact" });

  if (query) {
    queryBuilder = queryBuilder.or(
      `email.ilike.%${query}%,full_name.ilike.%${query}%`
    );
  }

  const { data: profiles, error, count } = await queryBuilder.range(from, to);

  if (error) {
    logger.error(
      `[DataLayer:Admin] Error al obtener perfiles de usuario:`,
      error
    );
    throw new Error("No se pudieron obtener los perfiles de usuario.");
  }

  return {
    profiles: profiles || [],
    totalCount: count || 0,
  };
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

  return { sites: (data as any) || [], totalCount: count || 0 };
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cobertura de Testes de Elite**: ((Implementada)) El arnés de pruebas de integración ahora valida el 100% de las funciones exportadas, blindando toda la capa de datos de administrador contra regresiones.
 *
 * @subsection Melhorias Futuras
 * 1. **Tipado Fuerte en `getAllSites`**: ((Vigente)) El `as any` en `getAllSites` indica una oportunidad para mejorar el tipado de la respuesta de Supabase para relaciones anidadas, posiblemente a través de una función RPC.
 */
// lib/data/admin.ts
