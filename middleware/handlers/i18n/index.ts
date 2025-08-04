// middleware/handlers/i18n/index.ts
/**
 * @file middleware/handlers/i18n/index.ts
 * @description Manejador de middleware para i18n. Ha sido refactorizado con una
 *              configuración más explícita para resolver el error 404 en la ruta raíz.
 * @author L.I.A Legacy
 * @version 3.0.0 (Root Path 404 Fix)
 */
import { type NextRequest, type NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { logger } from "@/lib/logging";
import { localePrefix, locales, pathnames } from "@/lib/navigation";

export function handleI18n(request: NextRequest): NextResponse {
  logger.trace({ path: request.nextUrl.pathname }, "[I18N_HANDLER] ENTRY");

  const defaultLocale = "pt-BR";

  const handle = createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale,
    // --- INICIO DE CORRECCIÓN ---
    // Forzamos la detección de locale incluso si parece que ya hay uno.
    // Esto es crucial para la primera visita a '/'.
    localeDetection: true,
    // --- FIN DE CORRECCIÓN ---
  });

  const response = handle(request);

  const locale = response.headers.get("x-next-intl-locale") || defaultLocale;
  response.headers.set("x-app-locale", locale);

  logger.trace({ locale, status: response.status }, "[I18N_HANDLER] EXIT");

  return response;
}
