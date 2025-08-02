// middleware.ts
/**
 * @file middleware.ts
 * @description Orquestador del pipeline de middleware. Refactorizado para
 *              utilizar manejadores atómicos y un pipeline declarativo.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 12.1.0 (Atomic Handler Pipeline)
 */
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "./lib/logging";
import { ROUTE_DEFINITIONS } from "./lib/routing-manifest";
import {
  handleAuth,
  handleI18n,
  handleLocaleFallback, // <-- NUEVO
  handleMaintenance,
  handleMultitenancy,
  handleRedirects,
  handleTelemetry, // <-- NUEVO
} from "./middleware/handlers"; // <-- ACTUALIZADO

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const earlyExitResponse =
    handleMaintenance(request) || handleRedirects(request);
  if (earlyExitResponse) return earlyExitResponse;

  let response = handleI18n(request);

  // El registro de telemetría es no bloqueante y se ejecuta para casi todas las peticiones.
  await handleTelemetry(request, response);

  // La lógica de fallback de idioma solo se ejecuta para nuevos usuarios.
  const localeFallbackResponse = handleLocaleFallback(request, response);
  if (localeFallbackResponse) return localeFallbackResponse;

  const detectedLocale = response.headers.get("x-app-locale") || "en-US";
  const pathnameWithoutLocale =
    request.nextUrl.pathname.replace(new RegExp(`^/${detectedLocale}`), "") ||
    "/";
  const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
    pathnameWithoutLocale.startsWith(r)
  );

  // Pipeline principal de lógica de negocio
  if (isProtectedRoute) {
    response = await handleMultitenancy(request, response);
  }

  response = await handleAuth(request, response);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|icons|favicon.ico|maintenance.html|browserconfig.xml|manifest.json).*)",
  ],
};

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la inteligencia y performance del middleware.
 * @subsection Mejoras Futuras
 * 1. **Cacheo de Búsqueda de Sitios:** (Vigente)
 * 2. **Manejo de Dominios Personalizados:** (Vigente)
 * 3. **Página de Subdominio Inválido:** (Vigente)
 * @subsection Mejoras Adicionadas
 * 1. **Integración de Fingerprint del Cliente:** (Vigente)
 * 2. **Procesamiento Asíncrono de Logs:** (Vigente)
 */
// middleware.ts
