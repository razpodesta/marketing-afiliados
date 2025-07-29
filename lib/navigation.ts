/**
 * @file lib/navigation.ts
 * @description Centraliza la configuración y las utilidades para el enrutamiento
 *              internacionalizado (i18n) a través de `next-intl`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (API Simplification & Type Alignment)
 */
import {
  createLocalizedPathnamesNavigation,
  type Pathnames,
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export const localePrefix = "as-needed";

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
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

export type AppPathname = keyof typeof pathnames;

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para llevar el sistema de navegación al siguiente nivel.
 *
 * 1.  **Localización Completa de URLs:** Utilizar plenamente la capacidad de `pathnames` para traducir las URLs. Por ejemplo: `"/login": { "en-US": "/login", "es-ES": "/iniciar-sesion" }`.
 * 2.  **Mapeo Automático de Rutas:** Crear un script que lea la estructura de directorios de `/app` y genere automáticamente una base para el objeto `pathnames`, reduciendo el mantenimiento manual.
 */
