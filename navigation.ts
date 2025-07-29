/**
 * @file lib/navigation.ts
 * @description Centraliza la configuración y las utilidades para el enrutamiento
 *              internacionalizado (i18n) a través de `next-intl`. Ahora soporta
 *              la construcción segura de rutas dinámicas.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Type-Safe Dynamic Routing)
 */

import {
  createLocalizedPathnamesNavigation,
  type Pathnames,
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export const localePrefix = "as-needed";

// El objeto `pathnames` sigue definiendo las plantillas de ruta.
export const pathnames = {
  "/": "/",
  "/login": "/login",
  "/admin": "/admin",
  "/dashboard": "/dashboard",
  "/dashboard/sites": "/dashboard/sites",
  // --- INICIO DE CORRECCIÓN: Definición de la plantilla de ruta dinámica ---
  "/dashboard/sites/[siteId]/campaigns": "/dashboard/sites/[siteId]/campaigns",
  // --- FIN DE CORRECCIÓN ---
  "/dashboard/settings": "/dashboard/settings",
  "/dev-console": "/dev-console",
  "/forgot-password": "/forgot-password",
  "/reset-password": "/reset-password",
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

export type AppPathname = keyof typeof pathnames;

// --- INICIO DE CORRECCIÓN: Función auxiliar para rutas dinámicas ---
/**
 * @function createPath
 * @description Construye una ruta de aplicación segura en tipos, reemplazando
 *              parámetros dinámicos en la plantilla de la ruta.
 * @param {AppPathname} path - La plantilla de la ruta, ej. '/dashboard/sites/[siteId]/campaigns'.
 * @param {Record<string, string | number>} params - Un objeto con los parámetros a reemplazar.
 * @returns {AppPathname} La URL final construida y tipada.
 * @example
 * createPath("/dashboard/sites/[siteId]/campaigns", { siteId: "123" });
 * // Devuelve: "/dashboard/sites/123/campaigns"
 */
export const createPath = (
  path: AppPathname,
  params: Record<string, string | number>
) => {
  let finalPath = path as string;
  for (const key in params) {
    finalPath = finalPath.replace(`[${key}]`, String(params[key]));
  }
  return finalPath as AppPathname;
};
// --- FIN DE CORRECCIÓN ---

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para llevar el sistema de navegación al siguiente nivel.
 *
 * 1.  **Localización Completa de URLs:** Utilizar plenamente la capacidad de `pathnames` para traducir las URLs. Por ejemplo: `"/login": { "en-US": "/login", "es-ES": "/iniciar-sesion" }`.
 * 2.  **Tipado de Parámetros de Ruta:** Explorar librerías como `next-typesafe-url` para generar tipos para los parámetros de la función `createPath` (ej. `params` tendría que ser `{ siteId: string | number }` para la ruta de campañas), previniendo errores en tiempo de compilación.
 * 3.  **Mapeo Automático de Rutas:** Crear un script que lea la estructura de directorios de `/app` y genere automáticamente una base para el objeto `pathnames`, reduciendo el mantenimiento manual.
 */
