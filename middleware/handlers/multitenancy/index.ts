// middleware/handlers/multitenancy/index.ts
/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ha sido refactorizado para recibir el logger vía inyección de
 *              dependencias.
 * @author L.I.A Legacy
 * @version 10.0.0 (Dependency Injection)
 */
import { kv } from "@vercel/kv";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/middleware";
import { rootDomain } from "@/lib/utils";

const CACHE_TTL_SECONDS = 900; // 15 minutos

type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};

async function getSiteIdFromCacheOrDb(
  subdomain: string,
  request: NextRequest,
  logger: Logger
): Promise<string | null> {
  const cacheKey = `subdomain:${subdomain}`;

  try {
    const cachedSiteId = await kv.get<string>(cacheKey);
    if (cachedSiteId) {
      logger.info("[MULTITENANCY_HANDLER] Cache HIT.", { subdomain });
      return cachedSiteId;
    }
  } catch (error) {
    logger.error("[MULTITENANCY_HANDLER] Critical error accessing Vercel KV.", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logger.info("[MULTITENANCY_HANDLER] Cache MISS. Querying database.", {
    subdomain,
  });
  const { supabase } = await createClient(request);
  const { data: siteData, error } = await supabase
    .from("sites")
    .select("id")
    .eq("subdomain", subdomain)
    .single();

  if (error && error.code !== "PGRST116") {
    logger.error(`[MULTITENANCY_HANDLER] Database error.`, {
      subdomain,
      error: error.message,
    });
    return null;
  }

  if (siteData) {
    logger.info("[MULTITENANCY_HANDLER] Site found in DB. Populating cache.", {
      siteId: siteData.id,
    });
    try {
      await kv.set(cacheKey, siteData.id, { ex: CACHE_TTL_SECONDS });
    } catch (error) {
      logger.error(
        "[MULTITENANCY_HANDLER] Critical error writing to Vercel KV.",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
    return siteData.id;
  }

  logger.warn("[MULTITENANCY_HANDLER] Site not found in DB.", { subdomain });
  return null;
}

export async function handleMultitenancy(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<NextResponse> {
  logger.trace("[MULTITENANCY_HANDLER] Auditing for multi-tenancy.");
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
    logger.trace("[MULTITENANCY_HANDLER] Subdomain detected.", { subdomain });
    const siteId = await getSiteIdFromCacheOrDb(subdomain, request, logger);

    if (siteId) {
      const rewriteUrl = new URL(
        `/${locale}/s/${subdomain}${pathname}`,
        request.url
      );
      logger.info("[MULTITENANCY_HANDLER] DECISION: Rewriting to site page.", {
        to: rewriteUrl.pathname,
      });
      return NextResponse.rewrite(rewriteUrl, { headers: response.headers });
    } else {
      logger.warn(
        "[MULTITENANCY_HANDLER] DECISION: Invalid subdomain. Passing to 404.",
        { subdomain }
      );
    }
  } else {
    logger.trace(
      "[MULTITENANCY_HANDLER] DECISION: No subdomain. Passing to next handler."
    );
  }

  return response;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Inyección de Dependencias**: ((Implementada)) El manejador ahora recibe y propaga el logger.
 */
// middleware/handlers/multitenancy/index.ts
