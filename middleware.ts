// middleware.ts
/**
 * @file middleware.ts
 * @description Orquestador del pipeline de middleware, ahora con un flujo de
 *              internacionalización corregido y estable.
 *              REFACTORIZADO: Se ha optimizado el `matcher` para excluir de forma
 *              más precisa los assets estáticos, mejorando el rendimiento y la
 *              limpieza de logs.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 25.0.0 (Optimized Matcher for Static Assets)
 */
import { type NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import {
  handleAuth,
  handleI18n,
  handleLocaleFallback,
  handleMaintenance,
  handleMultitenancy,
  handleRedirects,
  handleTelemetry,
} from "@/middleware/handlers";
import { logger as serverLogger } from "@/lib/logging";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  const { pathname } = request.nextUrl;
  const logger = serverLogger;

  logger.info(`[CHECKPOINT] INICIO_PIPELINE: ${pathname}`); // Punto de control 1

  try {
    const redirectsResponse = handleRedirects(request, logger);
    if (redirectsResponse) {
      logger.info(
        `[CHECKPOINT] REDIRECTS_HANDLER_EXIT: ${pathname} -> ${redirectsResponse.headers.get("location")}`
      ); // Punto de control 2
      return redirectsResponse;
    }

    const maintenanceResponse = handleMaintenance(request, logger);
    if (maintenanceResponse) {
      logger.info(
        `[CHECKPOINT] MAINTENANCE_HANDLER_EXIT: ${pathname} -> ${maintenanceResponse.headers.get("x-middleware-rewrite")}`
      ); // Punto de control 3
      return maintenanceResponse;
    }

    logger.info(`[CHECKPOINT] ANTES_I18N_HANDLER: ${pathname}`); // Punto de control 4
    let response = handleI18n(request, logger);
    logger.info(
      `[CHECKPOINT] DESPUES_I18N_HANDLER. Locale: ${response.headers.get("x-app-locale") || "N/A"}. Status: ${response.status} para: ${pathname}`
    ); // Punto de control 5

    // Si next-intl ya redirigió (ej. / -> /es-ES/), esa es la respuesta final para esta petición.
    if (response.status === 307 || response.status === 302) {
      logger.info(
        `[CHECKPOINT] I18N_HANDLER_REDIRIGIÓ: ${pathname}. Finalizando este ciclo.`
      ); // Punto de control 6
      return response;
    }

    // Continúa con los manejadores no bloqueantes/asíncronos
    handleTelemetry(request, response, logger).catch((err) => {
      logger.error("[MIDDLEWARE] Non-blocking telemetry handler failure.", {
        error: err,
      });
    });

    logger.info(`[CHECKPOINT] ANTES_LOCALE_FALLBACK: ${pathname}`); // Punto de control 7
    const localeFallbackResponse = handleLocaleFallback(
      request,
      response,
      logger
    );
    if (localeFallbackResponse) {
      logger.info(
        `[CHECKPOINT] LOCALE_FALLBACK_EXIT: ${pathname} -> ${localeFallbackResponse.headers.get("location")}`
      ); // Punto de control 8
      return localeFallbackResponse;
    }
    logger.info(`[CHECKPOINT] DESPUES_LOCALE_FALLBACK: ${pathname}`); // Punto de control 9

    logger.info(`[CHECKPOINT] ANTES_MULTITENANCY: ${pathname}`); // Punto de control 10
    response = await handleMultitenancy(request, response, logger);
    logger.info(
      `[CHECKPOINT] DESPUES_MULTITENANCY. Rewrite: ${response.headers.get("x-middleware-rewrite") || "NONE"} para: ${pathname}`
    ); // Punto de control 11

    logger.info(`[CHECKPOINT] ANTES_AUTH_HANDLER: ${pathname}`); // Punto de control 12
    response = await handleAuth(request, response, logger);
    logger.info(
      `[CHECKPOINT] DESPUES_AUTH_HANDLER. Estado final: ${response.status} para: ${pathname}`
    ); // Punto de control 13

    return response;
  } catch (error) {
    logger.error(`[CHECKPOINT] ERROR_NO_CAPTURA_PIPELINE: ${pathname}`, {
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
      pathname,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    const duration = Math.round(performance.now() - startTime);
    logger.info(
      `[CHECKPOINT] FIN_PIPELINE: ${pathname}. Duración: ${duration}ms`
    ); // Punto de control 14
  }
}

export const config = {
  // --- INICIO DE REFACTORIZACIÓN DEL MATCHER ---
  // Excluye las rutas que no necesitan ser procesadas por el middleware.
  // Ahora incluye `public/.*` para evitar procesar la mayoría de los assets estáticos
  // dentro de la carpeta `public`. También se incluyen archivos específicos de la raíz.
  matcher: [
    "/((?!api|_next/static|_next/image|sentry|favicon.ico|manifest.json|apple-touch-icon.png|public/.*).*)",
  ],
  // --- FIN DE REFACTORIZACIÓN DEL MATCHER ---
};

/* MEJORAS FUTURAS DETECTADAS
 * 1. **Manejo Específico de Errores de `NextResponse`**: ((Vigente)) El `catch` global es un buen fallback. Para mejorar, los manejadores individuales podrían ser más granulares al crear `NextResponse` de error (ej. 401 Unauthorized, 403 Forbidden) en lugar de depender siempre de una redirección o un error 500 genérico.
 * 2. **Cacheo de Respuestas Estáticas en el Edge**: ((Vigente)) Para ciertas rutas públicas que no cambian a menudo, se podría implementar un cacheado explícito en el Edge (`stale-while-revalidate`) directamente en el middleware, reduciendo la carga en los orígenes.
 * 3. **Observabilidad Avanzada (Next.js 15 'Edge Metrics')**: ((Vigente)) Si Next.js 15 proporciona APIs más detalladas de métricas de Edge (ej. CPU Time, Memory Usage) directamente en el middleware, integrar esa información con Sentry o un sistema de monitoreo personalizado sería una mejora de élite.
 * 4. **A/B Testing en el Edge**: ((Vigente)) Para futuras funcionalidades, el middleware podría integrar una lógica simple de A/B testing, reescribiendo a diferentes versiones de una página basada en cookies o Edge Configs.
 */
// middleware.ts
