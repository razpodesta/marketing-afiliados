// middleware.ts
/**
 * @file Middleware de Enrutamiento y Autorización
 * @description Este middleware es el corazón de la aplicación. Se ejecuta en cada petición
 * para determinar el enrutamiento correcto (subdominio vs. dominio principal) y aplicar
 * las políticas de autorización basadas en roles.
 *
 * @author Metashark
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth"; // Auth.js v5
import createIntlMiddleware from "next-intl/middleware";
import { locales, pathnames, localePrefix } from "./navigation";
import { rootDomain } from "./lib/utils";

/**
 * @description Middleware de internacionalización (i18n).
 * Gestiona los prefijos de idioma en las rutas del dominio principal.
 */
const intlMiddleware = createIntlMiddleware({
  locales,
  pathnames,
  localePrefix,
  defaultLocale: "en",
});

/**
 * @description Middleware principal de Auth.js.
 * Envuelve toda la lógica y se encarga de la protección de rutas.
 */
export default auth((request) => {
  const { nextUrl } = request;
  const host = request.headers.get("host") || "";

  // 1. Detección de Subdominio
  const subdomain = host.split(".")[0];
  const isSubdomainRequest =
    host !== rootDomain && host.endsWith(`.${rootDomain}`);

  if (isSubdomainRequest && subdomain) {
    console.log(
      `[Middleware] Subdomain detected: '${subdomain}'. Rewriting to /s/${subdomain}${nextUrl.pathname}`
    );
    // Reescribe la URL para renderizar la página del tenant
    return NextResponse.rewrite(
      new URL(`/s/${subdomain}${nextUrl.pathname}`, request.url)
    );
  }

  // 2. Lógica de Autorización para el Dominio Principal
  // `request.auth` contiene la sesión del usuario si está logueado.
  const session = request.auth;
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role || "guest";
  const pathname = nextUrl.pathname;

  // Extraer el locale para poder comparar rutas sin el prefijo de idioma
  const pathnameWithoutLocale =
    pathname.startsWith(`/${locales[0]}`) ||
    pathname.startsWith(`/${locales[1]}`)
      ? pathname.substring(3)
      : pathname;

  // Proteger la ruta de desarrollador
  if (pathnameWithoutLocale.startsWith("/dev-dashboard")) {
    if (userRole !== "developer") {
      // Si no es developer, redirigir al login o a una página de no autorizado.
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Proteger el panel de administración
  if (pathnameWithoutLocale.startsWith("/admin")) {
    if (!isLoggedIn) {
      // Si no está logueado, redirigir al login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userRole !== "admin" && userRole !== "developer") {
      // Si está logueado pero no tiene el rol correcto, redirigir al dashboard principal o a una página de error.
      return NextResponse.redirect(new URL("/dashboard", request.url)); // Asumiendo que /dashboard es la página del usuario 'user'
    }
  }

  // Si pasa todas las comprobaciones de autorización, aplicamos el i18n.
  return intlMiddleware(request);
});

export const config = {
  // El matcher se aplica a todas las rutas excepto a los assets estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

/* MEJORAS PROPUESTAS
 * 1. **Caché de Decisión de Roles:** Para usuarios con mucho tráfico, la sesión `request.auth` puede ser cacheadas brevemente en el edge para reducir la latencia de las verificaciones de rol.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a los usuarios sin el rol adecuado a otra página, se podría redirigir a una página genérica `/unauthorized` que explique por qué no pueden acceder.
 * 3. **Redirección de `www`:** Añadir lógica al principio para detectar y redirigir permanentemente (301) `www.yourdomain.com` a `yourdomain.com` para una consistencia de SEO.
 * 1. **Roles en Middleware:** Dentro de `authMiddleware`, una vez que `req.auth` contenga roles, se puede añadir lógica como: `if (pathnameWithoutLocale.startsWith('/admin') && req.auth.user.role !== 'admin') { ... }`.
 * 2. **Seguridad de Contraseñas:** En `auth.ts`, la prioridad número uno es reemplazar la comparación de contraseñas en texto plano por `bcrypt`. Se debe instalar (`pnpm add bcrypt @types/bcrypt`) y usar `bcrypt.hash` al crear usuarios y `bcrypt.compare` en la función `authorize`.
 * 1. **Roles en Middleware:** Dentro de `authMiddleware`, una vez que `req.auth` contenga roles, se puede añadir lógica como: `if (pathname.includes('/admin') && req.auth.user.role !== 'admin') { ... }`.
 * 2. **Manejo de Subdominios en Local:** La lógica actual para detectar subdominios en localhost es simple. Se puede mejorar para soportar URLs como `tenant.localhost:3000` de forma más fiable si es necesario.
 * 1. **Manejo de API:** Si se añaden rutas `/api`, se pueden añadir al matcher para excluirlas o manejarlas con un tipo de autenticación diferente (ej. API Key) dentro de este mismo middleware, antes de pasar a `intlMiddleware`.
 * 2. **Configuración de Dominio para i18n:** `next-intl` soporta configuración de dominios por idioma (ej. `metashark.com` para inglés y `metashark.es` para español), una estrategia avanzada para el futuro.
 * 1. **Rutas Públicas Explícitas:** En lugar de proteger todo bajo `/admin` por defecto, el `matcher` podría ser más granular para incluir/excluir rutas específicas, mejorando el rendimiento al no ejecutar el middleware donde no es necesario.
 * 2. **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar `www` y hacer una redirección 301 a la versión sin `www` para una consistencia de SEO.
 * 3. **Manejo de API Key para Rutas API:** Si en el futuro se crean rutas de API (`/api/*`), se podría añadir una lógica que verifique un `Bearer token` en la cabecera `Authorization` para peticiones de API, coexistiendo con la autenticación de sesión para el frontend.
 * 1. **Manejo de www:** La lógica actual trata `www` como un subdominio nulo. Se podría añadir una redirección explícita de `www.metashark.co` a `metashark.co` para una mejor SEO.
 * 2. **Cacheo de Decisiones:** Para subdominios o usuarios con mucho tráfico, las decisiones del middleware (como la comprobación de sesión) podrían ser cacheadas brevemente en el edge para reducir la latencia.
 */
