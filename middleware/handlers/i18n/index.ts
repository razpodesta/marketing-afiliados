// middleware/handlers/i18n/index.ts
/**
 * @file i18n.ts
 * @description Manejador de i18n canónico. Delega la detección y redirección
 *              a `next-intl`, que es la implementación optimizada, y se encarga
 *              de propagar el `locale` detectado para uso interno.
 *              REFACTORIZADO: Se ha corregido la sintaxis de configuración para
 *              alinearse con la API de `next-intl`, resolviendo los errores de compilación.
 * @author L.I.A Legacy
 * @version 15.0.0 (API Alignment Fix)
 */
import { type NextRequest, type NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import {
  locales,
  localePrefix,
  pathnames,
  type AppLocale,
} from "@/lib/navigation";

type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};

const DEFAULT_LOCALE: AppLocale = "pt-BR";

export function handleI18n(request: NextRequest, logger: Logger): NextResponse {
  logger.trace("[I18N_HANDLER] Delegando a next-intl middleware.");

  const pathname = request.nextUrl.pathname;
  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const handle = createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale: DEFAULT_LOCALE,
    localeDetection: !pathLocale,
  });

  const response = handle(request);

  const detectedLocale =
    response.headers.get("x-next-intl-locale") || DEFAULT_LOCALE;
  response.headers.set("x-app-locale", detectedLocale);
  logger.info("[I18N_HANDLER] `next-intl` procesado.", {
    detectedLocale,
  });

  return response;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Alineación de API**: ((Implementada)) Se ha corregido la estructura del objeto de configuración pasado a `createIntlMiddleware`, eliminando propiedades inválidas y sintaxis incorrecta para resolver los errores `TS18004` y `TS2561`.
 *
 * @subsection Melhorias Futuras
 * 1. **Dominios por Locale**: ((Vigente)) Investigar la configuración de `next-intl` para soportar dominios diferentes por idioma (ej. `metashark.es`, `metashark.com.br`) para una estrategia de SEO internacional avanzada.
 */
