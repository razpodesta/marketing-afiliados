// lib/navigation.ts
/**
 * @file lib/navigation.ts
 * @description Manifiesto de Enrutamiento y Contrato de Navegación.
 *              Este aparato es el sistema nervioso central para el enrutamiento
 *              internacionalizado (i18n). Ha sido auditado y completado para
 *              incluir todas las rutas operativas, garantizando una navegación
 *              100% tipada y funcional en toda la aplicación.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 7.3.0 (Complete Route Manifest)
 */
import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export type AppLocale = (typeof locales)[number];

export const localePrefix = "as-needed";

// Manifiesto de todas las rutas conocidas por la aplicación.
// Este objeto es el "contrato" que garantiza la seguridad de tipos.
export const pathnames = {
  // Rutas Públicas y de Autenticación
  "/": "/",
  "/login": "/login",
  "/forgot-password": "/forgot-password",
  "/reset-password": "/reset-password",
  "/choose-language": "/choose-language",
  "/auth-notice": "/auth-notice",
  "/welcome": "/welcome",

  // Rutas del Dashboard Principal
  "/dashboard": "/dashboard",
  "/dashboard/settings": "/dashboard/settings",
  "/dashboard/sites": "/dashboard/sites",
  "/dashboard/sites/[siteId]/campaigns": "/dashboard/sites/[siteId]/campaigns",

  // Rutas de Herramientas Principales
  "/builder/[campaignId]": "/builder/[campaignId]",
  "/lia-chat": "/lia-chat",

  // Rutas de Administración y Desarrollo
  "/admin": "/admin",
  "/dev-console": "/dev-console",
  "/dev-console/campaigns": "/dev-console/campaigns",
  "/dev-console/logs": "/dev-console/logs",
  "/dev-console/users": "/dev-console/users",
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

export type AppPathname = keyof typeof pathnames;

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para llevar el sistema de navegación al siguiente nivel.
 *
 * 1.  **Localización Completa de URLs:** (Vigente) Utilizar plenamente la capacidad de `pathnames` para traducir las URLs y mejorar el SEO internacional (ej. `"/login": { "es-ES": "/iniciar-sesion" }`).
 * 2.  **Mapeo Automático de Rutas:** (Vigente) Crear un script (`scripts/generate-routes-manifest.mjs`) que analice la estructura de directorios de `/app` y genere automáticamente este objeto `pathnames`, eliminando la posibilidad de desincronización manual.
 * 3.  **Tipado de Parámetros de Ruta:** (Vigente) Explorar librerías como `next-typesafe-url` para generar tipos para los parámetros de las rutas dinámicas, aunque la inferencia de `next-intl` ya nos da un alto nivel de seguridad.
 */
// lib/navigation.ts
