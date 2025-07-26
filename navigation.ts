/* Ruta: navigation.ts */

import { createLocalizedPathnamesNavigation } from "next-intl/navigation";

/**
 * @file navigation.ts
 * @description Centraliza la configuración y las utilidades para el enrutamiento
 * internacionalizado (i18n) a través de `next-intl`.
 *
 * @important
 * Las funciones exportadas aquí (`Link`, `redirect`, `usePathname`, `useRouter`)
 * están diseñadas para ser utilizadas **exclusivamente dentro de Componentes React
 * (Server y Client Components)**. NO deben ser usadas en archivos que se ejecutan
 * fuera del contexto de React, como el Middleware (`middleware.ts`). Para
 * redirecciones en el middleware, utilice `NextResponse.redirect` de `next/server`.
 *
 * @author Metashark
 * @version 3.1.0 (Usage Context Clarification)
 */
export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export const localePrefix = "as-needed";

// El `pathnames` permite mapear rutas a diferentes URLs por idioma.
// Por ahora, las rutas son las mismas, pero esto permite una futura localización de URLs.
export const pathnames = {
  "/login": "/login",
  "/admin": "/admin",
  "/dashboard": "/dashboard",
  "/forgot-password": "/forgot-password",
  "/reset-password": "/reset-password",
};

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });
/* Ruta: navigation.ts */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Pathnames Localizados:** Para un SEO óptimo, se podrían traducir las rutas en este archivo.
 *    Ejemplo: `/login`: { `en-US`: `/login`, `es-ES`: `/iniciar-sesion`, `pt-BR`: `/entrar` }.
2.  **Selector de Idioma en UI:** Añadir un componente en el `Header` o `Footer` que permita al
 *    usuario cambiar de idioma explícitamente, utilizando el `useRouter` y `usePathname` de esta
 *    configuración para cambiar de `locale` sin perder la página actual.
 * 1. **Pathnames Dinámicos:** A medida que se añadan rutas dinámicas (ej. `/dashboard/sites/[id]`), se pueden añadir a esta configuración para tener URLs internacionalizadas, como `/es/panel/sitios/[id]`.
 * 2. **Soporte de Más Idiomas:** Añadir nuevos idiomas es tan simple como añadirlos al array `locales` y crear el archivo de mensajes correspondiente en la carpeta `messages/`.
 */
