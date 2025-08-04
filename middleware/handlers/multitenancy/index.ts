// middleware/handlers/multitenancy/index.ts
/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ha sido hiper-optimizado con una capa de caché en el Edge (Vercel KV)
 *              para una resolución de subdominios de latencia ultra-baja.
 * @author L.I.A Legacy
 * @version 6.0.0 (Edge Caching Performance)
 */
import { kv } from "@vercel/kv";
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";
import { rootDomain } from "@/lib/utils";

const CACHE_TTL_SECONDS = 900; // 15 minutos

async function getSiteIdFromCacheOrDb(
  subdomain: string,
  request: NextRequest
): Promise<string | null> {
  const cacheKey = `subdomain:${subdomain}`;

  // 1. Intentar obtener de la caché del Edge
  try {
    const cachedSiteId = await kv.get<string>(cacheKey);
    if (cachedSiteId) {
      logger.trace({ subdomain }, "[MULTITENANCY_HANDLER] Cache HIT.");
      return cachedSiteId;
    }
  } catch (error) {
    logger.error("[MULTITENANCY_HANDLER] Error al acceder a Vercel KV:", error);
  }

  // 2. Cache Miss: Consultar la base de datos
  logger.trace(
    { subdomain },
    "[MULTITENANCY_HANDLER] Cache MISS. Consultando DB."
  );
  const { supabase } = await createClient(request);
  const { data: siteData, error } = await supabase
    .from("sites")
    .select("id")
    .eq("subdomain", subdomain)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error(
      `[MULTITENANCY_HANDLER] Error al buscar sitio en DB ${subdomain}:`,
      error
    );
    return null; // Fallo seguro, no cachear el error.
  }

  if (siteData) {
    // 3. Poblar la caché para futuras peticiones
    try {
      await kv.set(cacheKey, siteData.id, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      logger.error(
        "[MULTITENANCY_HANDLER] Error al escribir en Vercel KV:",
        error
      );
    }
    return siteData.id;
  }

  return null;
}

export async function handleMultitenancy(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const { host, pathname } = request.nextUrl;
  const locale = response.headers.get("x-app-locale") || "pt-BR";

  const rootDomainWithoutPort = rootDomain.split(":")[0];
  const hostWithoutPort = host.split(":")[0];

  const subdomain =
    hostWithoutPort !== rootDomainWithoutPort &&
    hostWithoutPort.endsWith(`.${rootDomainWithoutPort}`)
      ? hostWithoutPort.replace(`.${rootDomainWithoutPort}`, "")
      : null;

  if (subdomain) {
    const siteId = await getSiteIdFromCacheOrDb(subdomain, request);

    if (siteId) {
      const rewriteUrl = new URL(
        `/${locale}/s/${subdomain}${pathname}`,
        request.url
      );
      return NextResponse.rewrite(rewriteUrl, { headers: response.headers });
    }
  }

  return response;
}
