// middleware.ts
/**
 * @file middleware.ts
 * @description Orquestador del pipeline de middleware. Ha sido refactorizado
 *              para usar un logger específico y un matcher más permisivo,
 *              resolviendo el error 404 y restaurando la navegabilidad.
 * @author L.I.A Legacy
 * @version 17.0.0 (Routing & Logging Fix)
 */
import { type NextRequest, NextResponse } from "next/server";

// --- INICIO DE CORRECCIÓN ---
import { middlewareLogger as logger } from "@/lib/logging";
// --- FIN DE CORRECCIÓN ---
import { ROUTE_DEFINITIONS } from "@/lib/routing-manifest";
import {
  handleAuth,
  handleI18n,
  handleLocaleFallback,
  handleMaintenance,
  handleMultitenancy,
  handleRedirects,
  handleTelemetry,
} from "@/middleware/handlers";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  logger.trace(
    { path: request.nextUrl.pathname },
    "[MIDDLEWARE] Pipeline execution started."
  );

  try {
    const earlyExitResponse =
      handleRedirects(request) || handleMaintenance(request);
    if (earlyExitResponse) return earlyExitResponse;

    let response = handleI18n(request);
    await handleTelemetry(request, response);

    const localeFallbackResponse = handleLocaleFallback(request, response);
    if (localeFallbackResponse) return localeFallbackResponse;

    const detectedLocale = response.headers.get("x-app-locale") || "en-US";
    const pathname = request.nextUrl.pathname;
    const pathnameWithoutLocale =
      pathname.replace(new RegExp(`^/${detectedLocale}`), "") || "/";

    const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
      pathnameWithoutLocale.startsWith(r)
    );

    let businessLogicResponse = response;
    if (isProtectedRoute) {
      businessLogicResponse = await handleMultitenancy(
        request,
        businessLogicResponse
      );
    }
    businessLogicResponse = await handleAuth(request, businessLogicResponse);

    return businessLogicResponse;
  } catch (error) {
    logger.error(
      { error, pathname: request.nextUrl.pathname },
      "[MIDDLEWARE] Error no capturado."
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    const duration = Math.round(performance.now() - startTime);
    logger.trace(
      { duration_ms: duration, path: request.nextUrl.pathname },
      "[MIDDLEWARE] Pipeline execution finished."
    );
  }
}

// --- INICIO DE CORRECCIÓN ---
// Simplificamos el matcher para asegurar que se ejecute en TODAS las rutas de página,
// pero siga excluyendo los assets estáticos.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
// --- FIN DE CORRECCIÓN ---
