// middleware/handlers/multitenancy/index.ts
/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ha sido refactorizado para ser autónomo y compatible con el Edge Runtime,
 *              utilizando el cliente de Supabase para middleware y eliminando
 *              dependencias a la capa de datos del servidor.
 * @author L.I.A Legacy
 * @co-author MetaShark
 * @version 5.0.0 (Edge Runtime Compatibility & Architectural Purity)
 * @see {@link file://../../tests/infrastructure.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar la gestión de multi-tenancy en el Edge.
 *
 * 1.  **Cacheo de Búsqueda de Sitios (Redis/KV):** (Vigente) Para un rendimiento a escala de producción, la consulta a la base de datos dentro del middleware debería ser cacheada agresivamente.
 * 2.  **Manejo de Dominios Personalizados:** (Vigente) La función debería comprobar si `host` no es un subdominio y, si no lo es, buscar una coincidencia en una columna `custom_domain`.
 * 3.  **Página de Subdominio Inválido Dedicada:** (Vigente) Si un subdominio no se encuentra, se podría reescribir la URL a una página `/404-subdomain` con un mensaje de error más específico.
 */
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";
import { rootDomain } from "@/lib/utils";

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
    logger.trace({ subdomain }, "[MULTITENANCY_HANDLER] Subdominio detectado.");

    const { supabase } = await createClient(request);
    const { data: siteData, error } = await supabase
      .from("sites")
      .select("id")
      .eq("subdomain", subdomain)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error(
        `[MULTITENANCY_HANDLER] Error al buscar sitio ${subdomain}:`,
        error
      );
    }

    if (siteData) {
      logger.trace(
        { rewriteTo: `/${locale}/s/${subdomain}${pathname}` },
        "[MULTITENANCY_HANDLER] Sitio válido. Reescribiendo URL."
      );

      const rewriteUrl = new URL(
        `/${locale}/s/${subdomain}${pathname}`,
        request.url
      );

      const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
        headers: response.headers,
      });

      return rewriteResponse;
    }
  }

  return response;
}
// middleware/handlers/multitenancy/index.ts
