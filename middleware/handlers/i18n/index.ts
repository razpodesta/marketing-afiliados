// middleware/handlers/i18n/index.ts
/**
 * @file middleware/handlers/i18n/index.ts
 * @description Manejador de middleware para la internacionalización.
 * @author L.I.A Legacy
 * @version 1.1.0 (Path Fix)
 */
import { type NextRequest, type NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { logger } from "../../../lib/logging";
import { localePrefix, locales, pathnames } from "../../../navigation";

export function handleI18n(request: NextRequest): NextResponse {
  logger.trace("[I18N_HANDLER] Iniciando gestión de internacionalización.");

  const defaultLocale = "pt-BR";
  const handle = createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale,
    localeDetection: true,
  });

  const response = handle(request);

  const locale = response.headers.get("x-next-intl-locale") || defaultLocale;
  logger.trace({ locale }, "[I18N_HANDLER] Locale determinado.");

  response.headers.set("x-app-locale", locale);

  return response;
}
