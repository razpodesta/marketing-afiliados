// Ruta: navigation.ts
/**
 * @file navigation.ts
 * @description Centraliza la configuración y las utilidades para el enrutamiento
 * internacionalizado (i18n) a través de `next-intl`.
 * REFACTORIZACIÓN DE TIPOS: Se han añadido todas las rutas de navegación
 * principales de la aplicación a `pathnames` y se ha exportado el tipo `Pathname`
 * para garantizar una navegación completamente segura en tipos en toda la aplicación.
 *
 * @author Metashark
 * @version 3.4.0 (Fully Type-Safe Navigation)
 */

import type { Pathnames } from "next-intl/navigation";
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export const localePrefix = "as-needed";

export const pathnames = {
  "/": "/",
  "/login": "/login",
  "/admin": "/admin",
  "/dashboard": "/dashboard",
  "/dashboard/sites": "/dashboard/sites",
  "/dashboard/tools": "/dashboard/tools",
  "/dashboard/settings": "/dashboard/settings",
  "/dev-console": "/dev-console",
  "/forgot-password": "/forgot-password",
  "/reset-password": "/reset-password",
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

// CORRECCIÓN: Exportar el tipo Pathname para usarlo en otros componentes.
export type AppPathname = keyof typeof pathnames;

/* MEJORAS FUTURAS DETECTADAS
 * 1. Localización Completa de URLs: El siguiente paso natural es utilizar plenamente la capacidad de `pathnames` para traducir las URLs. Por ejemplo: `"/login": { "en-US": "/login", "es-ES": "/iniciar-sesion", "pt-BR": "/entrar" }`.
 * 2. Tipado Seguro para Rutas Dinámicas: Explorar librerías como `next-typesafe-url` para generar tipos para rutas con segmentos dinámicos (ej. `/dashboard/sites/[siteId]`), previniendo errores en la construcción de enlaces.
 * 3. Mapeo Automático de Rutas: Crear un script que lea la estructura de directorios de `/app` y genere automáticamente una base para el objeto `pathnames`, reduciendo el mantenimiento manual.
 */
