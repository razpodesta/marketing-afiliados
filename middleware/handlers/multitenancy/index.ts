// middleware/handlers/multitenancy/index.ts
import { type NextRequest, NextResponse } from "next/server";

import { getSiteDataByHost } from "../../../lib/data/sites";
import { logger } from "../../../lib/logging";
import { rootDomain } from "../../../lib/utils";

/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ahora forma parte de un pipeline, aceptando y devolviendo una
 *              respuesta para permitir el encadenamiento.
 * @author L.I.A Legacy
 * @version 3.0.0 (Chaining Refactor)
 */
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
    const siteData = await getSiteDataByHost(subdomain);
    if (siteData) {
      logger.trace(
        { rewriteTo: `/${locale}/s/${subdomain}${pathname}` },
        "[MULTITENANCY_HANDLER] Sitio válido. Reescribiendo URL."
      );
      // Devuelve una nueva respuesta de reescritura, terminando su parte de la cadena.
      return NextResponse.rewrite(
        new URL(`/${locale}/s/${subdomain}${pathname}`, request.url),
        { request }
      );
    }
  }

  // Si no hay acción de reescritura, devuelve la respuesta que recibió para continuar la cadena.
  return response;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Manejo de Dominios Personalizados: Esta es la siguiente evolución lógica. La función debería comprobar si `host` no es un subdominio, y si no lo es, llamar a `getSiteDataByHost(host)` para buscar una coincidencia en una columna `custom_domain`.
 * 2. Página de Subdominio Inválido Dedicada: Si un subdominio no se encuentra, se podría reescribir a una página `/404-subdomain` que muestre un mensaje específico.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Manejo de Dominios Personalizados: Esta es la siguiente evolución lógica. La función debería comprobar si `host` no es un subdominio, y si no lo es, llamar a `getSiteDataByHost(host)` para buscar una coincidencia en una columna `custom_domain`.
 * 2. Página de Subdominio Inválido Dedicada: Si un subdominio no se encuentra, se podría reescribir a una página `/404-subdomain` que muestre un mensaje específico.
 */
