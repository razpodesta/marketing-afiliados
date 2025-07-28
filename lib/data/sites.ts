// Ruta: lib/data/sites.ts
/**
 * @file sites.ts
 * @description Capa de Acceso a Datos para la entidad 'sites'.
 * REFACTORIZACIÓN DE FUNCIONALIDAD Y TIPOS:
 * 1. La función `getSitesByWorkspaceId` ahora soporta búsqueda y ordenamiento.
 * 2. La consulta incluye un conteo relacional de campañas.
 * 3. Se ha aplicado una aserción de tipo explícita en el retorno para
 *    garantizar la correcta inferencia de tipos en los componentes cliente,
 *    resolviendo la causa raíz de los errores de tipo 'never'.
 *
 * @author Metashark
 * @version 6.1.0 (Type-Safe Relational Query)
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";
import { unstable_cache as cache, revalidateTag } from "next/cache";

/**
 * @description Tipo base para un Sitio, extendido para incluir el conteo de campañas.
 */
export type SiteWithCampaignsCount = Tables<"sites"> & {
  campaigns: [{ count: number }];
};

/**
 * @description Obtiene los datos de un sitio directamente desde la base de datos.
 * @param {object} params - Los parámetros para identificar el sitio.
 * @param {string} [params.subdomain] - El subdominio a buscar.
 * @param {string} [params.customDomain] - El dominio personalizado a buscar.
 * @returns {Promise<Tables<"sites"> | null>} Los datos del sitio o null si no se encuentra.
 */
async function fetchSiteFromDB({
  subdomain,
  customDomain,
}: {
  subdomain?: string;
  customDomain?: string;
}): Promise<Tables<"sites"> | null> {
  const supabase = createClient();
  let query = supabase.from("sites").select("*");

  if (subdomain) {
    query = query.eq("subdomain", subdomain);
  } else if (customDomain) {
    query = query.eq("custom_domain", customDomain);
  } else {
    return null;
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    logger.error(
      `Error en DB al obtener sitio por ${subdomain || customDomain}:`,
      error
    );
    return null;
  }
  return data;
}

/**
 * @description Obtiene los datos de un sitio a partir de un host (subdominio o dominio personalizado).
 * @param {string} host - El host a buscar.
 * @returns {Promise<Tables<"sites"> | null>} Los datos del sitio o null si no se encuentra.
 */
export async function getSiteDataByHost(
  host: string
): Promise<Tables<"sites"> | null> {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  const isSubdomain = !sanitizedHost.includes(".");

  return await cache(
    async () => {
      const query = isSubdomain
        ? { subdomain: sanitizedHost }
        : { customDomain: sanitizedHost };
      return fetchSiteFromDB(query);
    },
    [`site-data-host-${sanitizedHost}`],
    { revalidate: 900, tags: [`sites:host:${sanitizedHost}`] }
  )();
}

/**
 * @deprecated Utilizar `getSiteDataByHost` en su lugar.
 * @param {string} subdomain - El subdominio a buscar.
 * @returns {Promise<Tables<"sites"> | null>}
 */
export async function getSiteDataBySubdomain(
  subdomain: string
): Promise<Tables<"sites"> | null> {
  return getSiteDataByHost(subdomain);
}

/**
 * @description Obtiene el nombre y subdominio de un sitio a partir de su ID.
 * @param {string} siteId - El UUID del sitio.
 * @returns {Promise<{ subdomain: string | null } | null>}
 */
export async function getSiteNameById(
  siteId: string
): Promise<{ subdomain: string | null } | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("subdomain")
    .eq("id", siteId)
    .single();
  if (error) {
    logger.error(`Error al obtener nombre del sitio ${siteId}:`, error);
    return null;
  }
  return data;
}

/**
 * @description Obtiene una lista paginada de todos los sitios de la plataforma.
 * @param {object} options - Opciones de paginación.
 * @returns {Promise<{ sites: Tables<"sites">[]; totalCount: number }>}
 */
export async function getAllSites({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{ sites: Tables<"sites">[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("sites")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) {
    logger.error("Error al obtener todos los sitios:", error);
    return { sites: [], totalCount: 0 };
  }
  return { sites: data, totalCount: count || 0 };
}

/**
 * @description Obtiene una lista paginada y filtrable de sitios para un workspace.
 * @param {string} workspaceId - El ID del workspace.
 * @param {object} options - Opciones de paginación, búsqueda y ordenamiento.
 * @returns {Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }>}
 */
export async function getSitesByWorkspaceId(
  workspaceId: string,
  {
    page = 1,
    limit = 10,
    query: searchQuery = "",
  }: { page?: number; limit?: number; query?: string }
): Promise<{ sites: SiteWithCampaignsCount[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("sites")
    .select("*, campaigns(count)")
    .eq("workspace_id", workspaceId);

  if (searchQuery) {
    query = query.ilike("subdomain", `%${searchQuery}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(
      `Error al obtener sitios para el workspace ${workspaceId}:`,
      error
    );
    return { sites: [], totalCount: 0 };
  }
  // CORRECCIÓN: Se añade una aserción de tipo para garantizar la forma de los datos.
  return { sites: data as SiteWithCampaignsCount[], totalCount: count || 0 };
}

/**
 * @description Invalida la caché para un host específico.
 * @param {string} host - El subdominio o dominio personalizado.
 */
export async function revalidateSiteDataByHostCache(host: string) {
  const sanitizedHost = host.toLowerCase().replace(/www\./, "");
  revalidateTag(`sites:host:${sanitizedHost}`);
  logger.info(`Caché para el host '${sanitizedHost}' invalidada.`);
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Caché Distribuida en el Borde (Edge Caching): Para una latencia aún más baja, la lógica de caché de `getSiteDataByHost` puede ser aumentada con una caché en el borde como Vercel KV o Upstash Redis, especialmente para ser llamada desde el middleware.
 * 2. Políticas de Seguridad (RLS) Robustas: La seguridad de los datos debe ser impuesta en la capa de base de datos con Políticas de Seguridad a Nivel de Fila (RLS) en Supabase para restringir las operaciones de escritura solo a los miembros del workspace correspondiente.
 * 3. Abstracción del Cliente Supabase: A medida que la capa de datos crezca, se podría crear una clase o un servicio de base de datos que encapsule el cliente de Supabase, facilitando las pruebas unitarias y la gestión de dependencias.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Implementación Real de Edge Cache: Reemplazar la simulación `edgeCache` con un cliente real de Vercel KV o Upstash Redis, configurando las variables de entorno necesarias. Esto moverá la mejora de conceptual a funcional.
 * 2. Políticas de Seguridad (RLS) Robustas: Aunque la lectura de sitios públicos no necesita RLS, las funciones como `getSitesByWorkspaceId` dependen de que las Server Actions que las llaman verifiquen los permisos. Una capa adicional de seguridad sería aplicar políticas de RLS en la base de datos para que la propia consulta falle si un usuario intenta acceder a workspaces que no le pertenecen.
 * 3. Inyección de Dependencias: Para arquitecturas más complejas y facilitar las pruebas unitarias (mocking), se podría implementar un patrón de inyección de dependencias para proporcionar el cliente de Supabase y el cliente de caché a estas funciones, en lugar de importarlos directamente.
 */
