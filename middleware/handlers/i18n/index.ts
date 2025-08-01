// middleware/handlers/i18n/index.ts
/**
 * @file middleware/handlers/i18n/index.ts
 * @description Manejador de middleware para la internacionalización (i18n).
 *              Este aparato es el primer punto de contacto lógico en el pipeline
 *              del middleware para determinar el idioma (locale) de la petición
 *              y reescribir la URL si es necesario.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 2.1.0 (High-Fidelity Documentation & Contract Reinforcement)
 */
import { type NextRequest, type NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { logger } from "@/lib/logging";
import { localePrefix, locales, pathnames } from "@/lib/navigation";

/**
 * @async
 * @function handleI18n
 * @description Orquesta la lógica de internacionalización para una petición entrante.
 *              Utiliza el middleware de `next-intl` para detectar el idioma preferido
 *              del usuario (a través de la URL, cookies o cabeceras del navegador),
 *              realiza las redirecciones o reescrituras necesarias y pasa el locale
 *              determinado a los siguientes manejadores a través de una cabecera personalizada.
 * @param {NextRequest} request - El objeto de la petición entrante.
 * @returns {NextResponse} Una respuesta que ha sido procesada por el middleware de `next-intl`,
 *                         lista para ser pasada al siguiente manejador en el pipeline.
 */
export function handleI18n(request: NextRequest): NextResponse {
  logger.trace("[I18N_HANDLER] Iniciando gestión de internacionalización.");

  const defaultLocale = "pt-BR";

  // Se crea una instancia del middleware de next-intl con la configuración
  // importada desde el manifiesto de enrutamiento, nuestra única fuente de verdad.
  const handle = createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale,
    localeDetection: true, // Habilita la detección automática del idioma del navegador.
  });

  const response = handle(request);

  // Añadimos una cabecera personalizada a la respuesta. Otros manejadores en el
  // pipeline pueden leer esta cabecera para conocer el locale determinado
  // sin necesidad de recalcularlo.
  const locale = response.headers.get("x-next-intl-locale") || defaultLocale;
  response.headers.set("x-app-locale", locale);

  logger.trace(
    { locale },
    "[I18N_HANDLER] Locale determinado y añadido a cabeceras."
  );

  return response;
}
// middleware/handlers/i18n/index.ts
