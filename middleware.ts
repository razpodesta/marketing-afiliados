// middleware.ts
/**
 * @file middleware.ts
 * @description Orquestador de middleware refactorizado a la arquitectura canónica
 *              de `next-intl`, resolviendo el bucle de redirección.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 30.0.0 (Canonical Next-Intl Chaining)
 */
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, type NextResponse } from "next/server";

import {
  handleAuth,
  handleMaintenance,
  handleMultitenancy,
  handleRedirects,
} from "@/middleware/handlers";
import { logger } from "@/lib/logging";
import { locales, localePrefix, pathnames } from "./lib/navigation";

const authMiddleware = async (
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> => {
  response = await handleMultitenancy(request, response, logger);
  response = await handleAuth(request, response, logger);
  return response;
};

const defaultMiddleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const redirectsResponse = handleRedirects(request, logger);
  if (redirectsResponse) return redirectsResponse;

  const maintenanceResponse = handleMaintenance(request, logger);
  if (maintenanceResponse) return maintenanceResponse;

  // La respuesta del middleware de i18n ya contiene el locale correcto.
  return createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale: "pt-BR",
  })(request);
};

export default async function middleware(
  request: NextRequest
): Promise<NextResponse> {
  const startTime = performance.now();
  const { pathname } = request.nextUrl;
  logger.trace(`[MIDDLEWARE] Pipeline execution started for ${pathname}.`);

  // Rutas que requieren autenticación y lógica de tenant
  const protectedPaths = ["/dashboard", "/builder", "/admin", "/dev-console"];
  const needsAuth = protectedPaths.some((path) => pathname.includes(path));

  let response: NextResponse;
  if (needsAuth) {
    // Primero ejecuta el middleware por defecto para obtener la respuesta de i18n,
    // luego pasa esa respuesta al middleware de autenticación.
    const defaultResponse = await defaultMiddleware(request);
    response = await authMiddleware(request, defaultResponse);
  } else {
    response = await defaultMiddleware(request);
  }

  const duration = Math.round(performance.now() - startTime);
  logger.trace(`[MIDDLEWARE] Pipeline finished for ${pathname}`, { duration });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Resolución de Bucle de Redirección**: ((Implementada)) Se ha adoptado el patrón de `createIntlMiddleware`, eliminando la lógica personalizada y la causa raíz del error `ERR_TOO_MANY_REDIRECTS`.
 * 2. **Simplificación Arquitectónica**: ((Implementada)) El código ahora es significativamente más simple, declarativo y alineado con las mejores prácticas de la librería `next-intl`.
 *
 * @subsection Melhorias Futuras
 * 1.  **Matcher más Específico**: ((Vigente)) El `matcher` puede ser afinado para excluir rutas adicionales que no requieran procesamiento, como las de Sentry.
 */
// middleware.ts
