// Ruta: lib/navigation.ts
/**
 * @file lib/navigation.ts
 * @description Manifiesto de Enrutamiento y Contrato de Navegación.
 *              Este aparato es el sistema nervioso central para el enrutamiento
 *              internacionalizado (i18n), alineado con la API moderna de `next-intl`.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 7.2.0 (Modern Type Inference Alignment)
 */
import {
  createLocalizedPathnamesNavigation,
  Pathnames, // Importamos el tipo `Pathnames` directamente.
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export type AppLocale = (typeof locales)[number];

export const localePrefix = "as-needed";

// Manifiesto de todas las rutas conocidas por la aplicación.
// Este objeto es el "contrato" que garantiza la seguridad de tipos.
export const pathnames = {
  "/": "/",
  "/login": "/login",
  "/admin": "/admin",
  "/dashboard": "/dashboard",
  "/dashboard/sites": "/dashboard/sites",
  "/dashboard/sites/[siteId]/campaigns": "/dashboard/sites/[siteId]/campaigns",
  "/dashboard/settings": "/dashboard/settings",
  "/dev-console": "/dev-console",
  "/forgot-password": "/forgot-password",
  "/reset-password": "/reset-password",
  "/builder/[campaignId]": "/builder/[campaignId]",
  // CORRECCIÓN: Se elimina el tipo obsoleto y se utiliza el tipo `Pathnames`
  // directamente, que es la forma moderna y recomendada. `satisfies` sigue
  // siendo una excelente práctica para asegurar la estructura sin perder
  // la especificidad de los tipos literales.
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

// Exporta un tipo inferido de las rutas para un tipado aún más fuerte.
// Este tipo ahora es la fuente de verdad para el resto de la aplicación.
export type AppPathname = keyof typeof pathnames;

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `navigation.ts` es el contrato de enrutamiento de la aplicación.
 *
 * @functionality
 * - Define todos los idiomas (`locales`) y las rutas (`pathnames`) que la aplicación conoce.
 * - **Análisis de la Deprecación:** El tipo `PathnamesType` (que era un alias de `Pathnames`)
 *   está en desuso porque la librería `next-intl` ha evolucionado. El nuevo paradigma
 *   favorece la inferencia de tipos directa desde nuestro objeto `pathnames`.
 * - **Solución Arquitectónica:** Al usar `satisfies Pathnames<typeof locales>`, mantenemos
 *   una verificación estructural, pero lo más importante es que la función
 *   `createLocalizedPathnamesNavigation` ahora infiere los tipos de `Link`, `useRouter`, etc.,
 *   con una precisión mucho mayor a partir de las claves literales de nuestro objeto.
 *   Esto significa que el router no solo sabe que `params` existe, sino que sabe que para la
 *   ruta `/builder/[campaignId]`, el objeto `params` DEBE tener una propiedad `campaignId`.
 *   Este es un nivel de seguridad de tipos superior al anterior.
 *
 * @relationships
 * - Es la fuente de verdad para el `middleware.ts` y para cualquier componente que realice navegación.
 *
 * @expectations
 * - Al eliminar la dependencia del tipo obsoleto, aseguramos la compatibilidad futura del
 *   proyecto. Además, al depender de la inferencia de tipos mejorada, resolvemos la
 *   causa raíz de los errores `TS2345` que veíamos en componentes como `LanguageSwitcher`,
 *   ya que el router ahora "entiende" los parámetros específicos de cada ruta dinámica.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para llevar el sistema de navegación al siguiente nivel.
 *
 * 1.  **Localización Completa de URLs:** (Revalidado) Utilizar plenamente la capacidad de `pathnames` para traducir las URLs y mejorar el SEO internacional (ej. `"/login": { "es-ES": "/iniciar-sesion" }`).
 * 2.  **Mapeo Automático de Rutas:** (Revalidado) Crear un script (`scripts/generate-routes-manifest.mjs`) que analice la estructura de directorios de `/app` y genere automáticamente este objeto `pathnames`.
 * 3.  **Tipado de Parámetros de Ruta:** (Revalidado) Explorar librerías como `next-typesafe-url` para generar tipos para los parámetros de las rutas dinámicas, aunque la inferencia de `next-intl` ya nos da un alto nivel de seguridad.
 */
// Ruta: lib/navigation.ts
