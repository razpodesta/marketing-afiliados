// Ruta: middleware/handlers/i18n/index.ts
/**
 * @file middleware/handlers/i18n/index.ts
 * @description Manejador de middleware para la internacionalización (i18n).
 *              Este aparato es el primer punto de contacto lógico en el pipeline
 *              del middleware para determinar el idioma (locale) de la petición
 *              y reescribir la URL si es necesario.
 * @author L.I.A Legacy & RaZ Podestá
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la estrategia de internacionalización.
 *
 * 1.  **Persistencia del Idioma Preferido (Cookie):** (Revalidado) La detección actual se basa en el navegador. Una mejora significativa sería que, cuando un usuario cambia de idioma a través del `LanguageSwitcher`, su preferencia se guarde en una cookie. El `createIntlMiddleware` puede ser configurado para leer esta cookie, dándole prioridad sobre la detección del navegador. (IMPLEMENTADO EN LanguageSwitcher.tsx)
 * 2.  **Geolocalización por IP:** Para una detección inicial aún más precisa, se podría utilizar la IP del usuario (disponible en Vercel Edge) para inferir su país y establecer un `locale` por defecto más apropiado antes de recurrir a las cabeceras del navegador.
 * 3.  **Dominios por Idioma:** Para una estrategia de SEO internacional de élite, `next-intl` soporta la configuración de dominios por idioma (ej. `metashark.com` para `en-US` y `metashark.es` para `es-ES`). La configuración en este manejador se expandiría para soportar este mapeo.
 */

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `i18n/index.ts` es el pilar de la experiencia de usuario
 *               internacionalizada.
 *
 * @functionality
 * - **Orquestación de `next-intl`:** Es un wrapper delgado alrededor del middleware oficial
 *   de `next-intl`. Su única responsabilidad es configurarlo con los parámetros correctos
 *   importados desde `lib/navigation.ts` (locales, pathnames, etc.), actuando como un
 *   punto de configuración centralizado.
 * - **Detección de Idioma:** La configuración `localeDetection: true` le indica a `next-intl`
 *   que inspeccione las cabeceras `Accept-Language` de la petición del navegador para
 *   determinar el idioma preferido del usuario y redirigirlo si es necesario.
 * - **Comunicación entre Handlers:** Una vez que `next-intl` determina el `locale` correcto,
 *   este manejador lo extrae de la cabecera `x-next-intl-locale` y lo establece en una
 *   cabecera personalizada (`x-app-locale`). Esto permite que los manejadores posteriores
 *   en el pipeline (como el de autenticación) puedan leer fácilmente el idioma sin tener
 *   que recalcularlo.
 *
 * @relationships
 * - Es el primer manejador lógico en el pipeline definido en `middleware.ts`.
 * - Depende de forma crítica de `lib/navigation.ts` como su única fuente de verdad para la
 *   configuración de enrutamiento.
 *
 * @expectations
 * - Se espera que este aparato sea el único responsable de la lógica de reescritura de URLs
 *   relacionada con el idioma. Su correcto funcionamiento asegura que cada usuario vea la
 *   aplicación en el idioma correcto y que todas las URLs se construyan de forma consistente.
 * =================================================================================================
 */
