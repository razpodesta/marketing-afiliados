/* Ruta: middleware.ts */

import { createClient } from "@/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { rootDomain } from "./lib/utils";
import { localePrefix, locales, pathnames } from "./navigation";
import { getSiteDataBySubdomain } from "./lib/data/sites";

/**
 * @file middleware.ts
 * @description Middleware principal de la aplicación.
 * MEJORA DE SEGURIDAD: Se ha añadido la ruta `/dev-console` a la lista de
 * rutas protegidas. El middleware ahora bloqueará el acceso a usuarios no
 * autenticados a esta nueva sección crítica.
 *
 * @author Metashark
 * @version 18.0.0 (Dev Console Route Protection)
 */

export async function middleware(request: NextRequest) {
  const { pathname, origin, host } = request.nextUrl;

  if (
    process.env.MAINTENANCE_MODE === "true" &&
    !pathname.startsWith("/maintenance") &&
    !request.cookies.has("maintenance_bypass")
  ) {
    return NextResponse.rewrite(new URL("/maintenance.html", request.url));
  }

  if (host.startsWith("www.")) {
    const newHost = host.replace("www.", "");
    const newUrl = new URL(pathname, `https://${newHost}`);
    return NextResponse.redirect(newUrl, 301);
  }

  const intlResponse = createIntlMiddleware({
    locales,
    localePrefix,
    pathnames,
    defaultLocale: "pt-BR",
  })(request);
  const locale = intlResponse.headers.get("x-next-intl-locale") || "pt-BR";

  const rootDomainWithoutPort = rootDomain.split(":")[0];
  const hostWithoutPort = host.split(":")[0];
  const subdomain =
    hostWithoutPort !== rootDomainWithoutPort &&
    hostWithoutPort.endsWith(`.${rootDomainWithoutPort}`)
      ? hostWithoutPort.replace(`.${rootDomainWithoutPort}`, "")
      : null;

  if (subdomain) {
    const siteData = await getSiteDataBySubdomain(subdomain);
    if (siteData) {
      return NextResponse.rewrite(
        new URL(`/${locale}/s/${subdomain}${pathname}`, request.url)
      );
    }
    return intlResponse;
  }

  const supabase = (await createClient(request)).supabase;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;

  // Se añade `/dev-console` a las rutas que requieren una sesión.
  const protectedRoutes = ["/dashboard", "/admin", "/dev-console"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (!session && isProtectedRoute) {
    const loginUrl = new URL(`/${locale}/login`, origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathnameWithoutLocale.startsWith("/login")) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|maintenance.html).*)",
  ],
};

export const runtime = "nodejs";
/* Ruta: middleware.ts */

/* MEJORAS PROPUESTAS (Consolidadas)
 * 1. **CACHE DE SUBDOMINIOS (CRÍTICO):** La consulta `getSiteDataBySubdomain` en el middleware añade latencia. Es fundamental implementar una caché (ej. Vercel KV, Upstash Redis) para los resultados de esta consulta, invalidándola solo cuando un sitio se crea o elimina.
 * 2. **Manejo de Dominios Personalizados:** El siguiente paso es expandir la lógica para que, si no se detecta un subdominio, se consulte una columna `custom_domain` en la tabla `sites`. Si se encuentra una coincidencia, se reescribe la URL al subdominio interno correspondiente.
 * 3. **Firewall de IPs para Mantenimiento:** La lógica actual de bypass de mantenimiento usa una cookie. Para un control más seguro, se podría leer la IP del solicitante (a través de `request.ip`) y compararla con una lista blanca de IPs de desarrolladores definida en las variables de entorno./* MEJORAS PROPUESTAS
 * 1. **CACHE DE SUBDOMINIOS (CRÍTICO):** La consulta `getSiteDataBySubdomain` en el middleware añade latencia. Es fundamental implementar una caché (ej. Vercel KV, Upstash Redis) para los resultados de esta consulta. La caché se invalidaría (o actualizaría) solo cuando un sitio se crea o elimina, reduciendo la carga en la base de datos a casi cero para este path.
 * 2. **Manejo de Dominios Personalizados:** La lógica actual solo maneja subdominios. El siguiente paso es expandirla para que, si no se detecta un subdominio, se consulte una columna `custom_domain` en la tabla `sites`. Si se encuentra una coincidencia, se reescribe la URL al subdominio interno correspondiente, completando la arquitectura multi-tenant.
 * 3. **Firewall de IPs para Mantenimiento:** La lógica actual de bypass de mantenimiento usa una cookie. Para un control más seguro, se podría leer la IP del solicitante (a través de `request.ip`) y compararla con una lista blanca de IPs de desarrolladores definida en las variables de entorno.
 * 1. **Manejo de Dominios Personalizados:** Implementar la lógica para consultar la base de datos (con una caché de Redis/Vercel KV para rendimiento) y mapear un dominio personalizado (ej. `www.cliente.com`) a su subdominio interno (`cliente.metashark.com`), completando la arquitectura multi-tenant.
 * 2. **Geolocalización por IP:** En lugar de depender solo del `Accept-Language` header, se podría usar la IP del usuario (disponible en Vercel) para una detección de idioma más precisa y para ofrecer contenido geolocalizado (ej. precios en moneda local).
 * 3. **Firewall de Rutas (A/B Testing, Feature Flags):** El middleware es el lugar perfecto para implementar A/B testing o feature flags. Se podría leer una cookie o un parámetro de la sesión para redirigir a un porcentaje de usuarios a una versión alternativa de una página (ej. `/v2/pricing`).
1.  **Detección de Idioma del Navegador:** Configurar `next-intl` para detectar el `Accept-Language` header.
2.  **Manejo de Dominios Personalizados:** Añadir lógica para reconocer dominios personalizados.
3.  **Redirección de `www`:** Implementar redirección 301 para SEO.
4.  **Redirección con `callbackUrl`:** Redirigir a los usuarios a la página que intentaban visitar antes del login.
1.  **Detección de Idioma del Navegador:** Configurar `next-intl` para detectar el `Accept-Language` header del usuario.
2.  **Manejo de Dominios Personalizados:** Añadir lógica para reconocer dominios personalizados de los tenants.
3.  **Redirección de `www`:** Implementar redirección 301 de `www.dominio.com` a `dominio.com` para SEO.
4.  **Redirección con `callbackUrl`:** Para una UX mejorada, si un usuario no autenticado intenta acceder a `/dashboard/settings`, el middleware puede redirigirlo a `/login?callbackUrl=/dashboard/settings`. Después de un login exitoso, la aplicación lo redirigiría de vuelta a la página que intentó visitar originalmente.
1.  **Detección de Idioma del Navegador:** Configurar `next-intl` para detectar el `Accept-Language` header del usuario.
2.  **Manejo de Dominios Personalizados:** Añadir lógica para reconocer dominios personalizados de los tenants.
3.  **Redirección de `www`:** Implementar redirección 301 de `www.dominio.com` a `dominio.com` para SEO.
1.  **Detección de Idioma del Navegador:** `next-intl` puede configurarse para detectar automáticamente el idioma
 *    preferido del navegador del usuario (`Accept-Language` header) y redirigirlo a ese `locale` en su
 *    primera visita, en lugar de usar siempre `pt-BR`. Esto mejora la experiencia de usuario inicial.
2.  **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para
 *    reconocer dominios personalizados, consultando la tabla `sites` y reescribiendo la URL al
 *    subdominio interno correspondiente.
3.  **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar si el `host`
 *    empieza con `www.` y hacer una redirección 301 (permanente) a la versión sin `www` para
 *    consistencia de SEO.
 * 1. **Matcher más Granular:** Para un control aún más fino, el matcher puede ser un array de strings, excluyendo rutas específicas una por una, ej: `['/((?!api|_next).*)', '/es', '/en']`.
 * 2. **Middleware Anidado (Experimental):** Investigar el uso de la característica de "middleware anidado" de Next.js para aplicar diferentes lógicas de middleware a diferentes segmentos de ruta (ej. uno para `/admin` y otro para `/dashboard`).
 * 1. **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para reconocer dominios personalizados, consultando la tabla `sites` y reescribiendo la URL al subdominio interno correspondiente.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a `/login`, se podría redirigir a una página `/unauthorized` para una UX más clara cuando un usuario autenticado intenta acceder a una ruta para la que no tiene permisos.
 * 1. **Logging en el Edge:** Para depurar el middleware en producción, se puede usar `console.log`. Plataformas como Vercel exponen estos logs, lo que es útil para trazar redirecciones o el comportamiento de enrutamiento por subdominio.
 * 2. **Optimización del Matcher:** A medida que se añadan más rutas públicas que no requieran lógica de sesión (ej. `/blog/[slug]`), se pueden añadir al `matcher` usando negative lookaheads para que el middleware no se ejecute innecesariamente, mejorando el rendimiento.
 * 1. **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para reconocer dominios personalizados, consultando la tabla `sites` y reescribiendo la URL al subdominio interno correspondiente.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a `/dashboard`, se podría redirigir a una página `/unauthorized` para una UX más clara cuando un usuario autenticado intenta acceder a una ruta para la que no tiene permisos.
 * 3. **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar si el `host` empieza con `www.` y hacer una redirección 301 (permanente) a la versión sin `www` para consistencia de SEO.
 * 1. **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para reconocer dominios personalizados, consultando la tabla `sites` y reescribiendo la URL al subdominio interno correspondiente.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a `/dashboard`, se podría redirigir a una página `/unauthorized` para una UX más clara cuando un usuario autenticado intenta acceder a una ruta para la que no tiene permisos.
 * 3. **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar si el `host` empieza con `www.` y hacer una redirección 301 (permanente) a la versión sin `www` para consistencia de SEO.
 * 1. **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para reconocer dominios personalizados, consultando la tabla `sites` y reescribiendo la URL al subdominio interno correspondiente.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a `/dashboard`, se podría redirigir a una página `/unauthorized` para una UX más clara.
 * 3. **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar si el `host` empieza con `www.` y hacer una redirección 301 (permanente) a la versión sin `www` para consistencia de SEO.
 * 1. **Manejo de Dominios Personalizados:** El siguiente gran paso en el enrutamiento sería añadir lógica para reconocer dominios personalizados. Esto implicaría una consulta a la tabla `sites` en el middleware para ver si el `host` de la petición coincide con un `custom_domain` y reescribir a la ruta `/s/[subdomain]` correspondiente.
 * 2. **Página de "Acceso Denegado":** En lugar de redirigir a los usuarios sin el rol adecuado a `/dashboard`, se podría redirigir a una página genérica `/unauthorized` que explique por qué no pueden acceder, mejorando la claridad para el usuario.
 * 3. **Redirección de `www`:** Añadir una lógica al principio del middleware para detectar si el `host` empieza con `www.` y, si es así, hacer una redirección 301 (permanente) a la versión sin `www` para una consistencia de SEO.
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
