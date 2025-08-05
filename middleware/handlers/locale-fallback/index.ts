// middleware/handlers/locale-fallback/index.ts
/**
 * @file locale-fallback/index.ts
 * @description Manejador de middleware para el fallback de idioma. Este aparato
 *              actúa como la última línea de defensa para determinar el idioma
 *              de un usuario, intentando GeoIP o redirigiendo a una selección manual.
 *              Ha sido re-implementado para resolver el error TS2305 y su lógica
 *              es ahora canónica y atómica.
 * @author L.I.A Legacy
 * @version 13.0.0 (Canonical Re-implementation & Export Fix)
 */
import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator"; // Para la lógica de Accept-Language si es necesario
import { match } from "@formatjs/intl-localematcher"; // Para la lógica de Accept-Language si es necesario

import { locales, type AppLocale } from "@/lib/navigation"; // Importamos AppLocale para tipado estricto

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
// Se define el tipo Logger localmente.
type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};

const DEFAULT_LOCALE: AppLocale = "pt-BR"; // Consistente con i18n.ts

export function handleLocaleFallback(
  request: NextRequest,
  response: NextResponse, // Recibimos la respuesta del handler anterior (handleI18n)
  logger: Logger
): NextResponse | null {
  logger.trace("[LOCALE_FALLBACK_HANDLER] Auditing for locale fallback.");
  const { pathname } = request.nextUrl;
  const detectedLocaleFromPreviousHandler =
    response.headers.get("x-app-locale");

  // Casos en los que no necesitamos intervenir con el fallback
  const isStaticAsset = pathname.includes("."); // Ej. /favicon.ico, /images/logo.png
  const isApiRoute = pathname.startsWith("/api/");
  const isChooseLanguagePage = pathname.endsWith("/choose-language");
  const hasLocaleChosenCookie = request.cookies.has("NEXT_LOCALE_CHOSEN");

  if (isStaticAsset || isApiRoute || isChooseLanguagePage) {
    logger.trace(
      "[LOCALE_FALLBACK_HANDLER] DECISION: Skipping locale fallback for special paths.",
      { pathname }
    );
    return null; // Dejar que el pipeline continúe con la respuesta actual.
  }

  // Si `next-intl` ya determinó un locale y lo prefijó, o el usuario ya lo eligió explícitamente, no hay nada que hacer aquí.
  // La `handleI18n` ya redirige `/` a `/[locale]/` si hay una preferencia.
  // Este handler actúa si la URL actual *no* tiene un prefijo de locale y no fue redirigida por `handleI18n`.
  const pathHasLocalePrefix = locales.some((locale) =>
    pathname.startsWith(`/${locale}`)
  );

  if (pathHasLocalePrefix && detectedLocaleFromPreviousHandler) {
    logger.trace(
      "[LOCALE_FALLBACK_HANDLER] DECISION: Path already has a locale prefix and locale detected by next-intl. No fallback needed."
    );
    return null;
  }

  // --- Lógica de Detección de Idioma de Fallback ---
  let finalLocaleToUse: AppLocale = DEFAULT_LOCALE;

  // 1. Intentar GeoIP (si está disponible y no se ha detectado locale por next-intl)
  const country = request.geo?.country;
  if (country) {
    // Mapeo simple de país a idioma.
    const countryToLocaleMap: Record<string, AppLocale> = {
      // <-- Se tipa el valor como AppLocale
      BR: "pt-BR", // Brasil
      ES: "es-ES", // España
      US: "en-US", // Estados Unidos
      GB: "en-US", // Reino Unido
      CA: "en-US", // Canadá (simplificado)
    };
    const geoLocale = countryToLocaleMap[country];

    // Aserción de tipo explícita aquí, ya que countryToLocaleMap podría tener claves `string` que no están en `locales`
    if (geoLocale && locales.includes(geoLocale)) {
      // geoLocale ya es de tipo AppLocale por el mapeo
      finalLocaleToUse = geoLocale;
      logger.info(
        "[LOCALE_FALLBACK_HANDLER] DECISION: Locale inferred from GeoIP.",
        { country, inferredLocale: geoLocale }
      );
      // Redirigir a la URL con el prefijo de locale.
      const redirectPath = `/${finalLocaleToUse}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // 2. Si GeoIP no funcionó o no fue preciso, y no hay cookie ni Accept-Language reconocido por next-intl (ya que pasó por handleI18n),
  //    redirigir a la página de selección manual de idioma.
  //    La lógica de `next-intl` ya debería haber hecho esto para `/` si no hay `Accept-Language`.
  //    Este es un caso para rutas internas que no tienen un locale y no fueron manejadas.
  if (
    !detectedLocaleFromPreviousHandler ||
    detectedLocaleFromPreviousHandler === DEFAULT_LOCALE // Solo si no se detectó nada mejor que el default
  ) {
    const redirectUrl = new URL(
      `/${DEFAULT_LOCALE}/choose-language`,
      request.url
    );
    logger.warn(
      "[LOCALE_FALLBACK_HANDLER] DECISION: No explicit locale detected. Redirecting to manual language selection.",
      { pathname }
    );
    return NextResponse.redirect(redirectUrl);
  }
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

  logger.trace(
    "[LOCALE_FALLBACK_HANDLER] DECISION: No fallback redirect needed. Passing through."
  );
  return null;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Re-implementación Canónica**: ((Implementada)) Se ha re-implementado la función `handleLocaleFallback` para que cumpla su propósito de ser la lógica de fallback final de idioma, resolviendo el error `TS2305` y la inconsistencia de nombres.
 * 2. **Lógica de GeoIP y Fallback Explícita**: ((Implementada)) Se ha incorporado la lógica de GeoIP y la redirección a `/choose-language` basada en el flujo esperado por los diagramas del proyecto y las pruebas unitarias.
 * 3. **Definición de Tipo Local de Logger**: ((Implementada)) Se ha definido el tipo `Logger` localmente para eliminar dependencias externas y conflictos.
 *
 * @subsection Melhorias Futuras
 * 1. **Mapeo de Locales Más Robusto**: ((Vigente)) El mapeo de `countryToLocaleMap` es básico. Podría obtenerse de una tabla de configuración o un servicio externo para ser más dinámico y completo.
 * 2. **Cacheo de GeoIP**: ((Vigente)) Si se utiliza un servicio de GeoIP externo, se podría cachear los resultados para evitar llamadas repetidas.
 * 3. **Mensaje Contextual en `choose-language`**: ((Vigente)) La redirección a `choose-language` podría incluir parámetros de búsqueda (`?reason=no-locale` o `?reason=geoip-failed`) para que la página de selección manual muestre un mensaje más contextual.
 */
// middleware/handlers/locale-fallback/index.ts
