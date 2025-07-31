// Ruta: middleware.ts
/**
 * @file middleware.ts
 * @description Orquestador del pipeline de middleware. Refactorizado para utilizar un
 *              patrón de diseño de Pipeline declarativo, estableciendo un estándar de
 *              ingeniería superior para el control de flujo de peticiones.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 9.0.0 (Declarative Pipeline Pattern)
 */
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "./lib/logging";
import { ROUTE_DEFINITIONS } from "./lib/routing-manifest";
import {
  handleAuth,
  handleI18n,
  handleMaintenance,
  handleMultitenancy,
  handleRedirects,
} from "./middleware/handlers";

type MiddlewareHandler = (
  request: NextRequest,
  response: NextResponse
) => Promise<NextResponse> | NextResponse;

/**
 * @class MiddlewarePipeline
 * @description Una clase que implementa el patrón de diseño de Pipeline para
 *              encadenar y ejecutar manejadores de middleware de forma secuencial.
 */
class MiddlewarePipeline {
  private readonly handlers: MiddlewareHandler[] = [];
  private request: NextRequest;
  private response: NextResponse;

  constructor(request: NextRequest, initialResponse: NextResponse) {
    this.request = request;
    this.response = initialResponse;
  }

  /**
   * @description Registra un manejador en el pipeline.
   * @param {MiddlewareHandler} handler - La función manejadora.
   * @returns {this} La instancia del pipeline para permitir el encadenamiento.
   */
  public use(handler: MiddlewareHandler): this {
    this.handlers.push(handler);
    return this;
  }

  /**
   * @description Ejecuta el pipeline. Itera sobre los manejadores registrados,
   *              pasando la respuesta del anterior al siguiente.
   * @returns {Promise<NextResponse>} La respuesta final después de que todos los manejadores se hayan ejecutado.
   */
  public async run(): Promise<NextResponse> {
    for (const handler of this.handlers) {
      this.response = await handler(this.request, this.response);
    }
    return this.response;
  }
}

/**
 * @function getPathnameWithoutLocale
 * @description Extrae de forma segura el pathname sin el prefijo del locale.
 * @param {NextRequest} request - La petición entrante.
 * @param {string} locale - El locale detectado.
 * @returns {string} El pathname limpio.
 */
function getPathnameWithoutLocale(
  request: NextRequest,
  locale: string
): string {
  const { pathname } = request.nextUrl;
  return pathname.replace(new RegExp(`^/${locale}`), "") || "/";
}

/**
 * @async
 * @function middleware
 * @description Punto de entrada principal para el middleware de la aplicación.
 * @param {NextRequest} request - La petición entrante.
 * @returns {Promise<NextResponse>} La respuesta final.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  logger.trace(
    { path: request.nextUrl.pathname, method: request.method },
    "[PIPELINE] >>> INICIO Petición entrante."
  );

  // --- Nivel 1: Terminación Temprana (Manejadores que pueden detener el pipeline) ---
  const earlyExitResponse =
    handleMaintenance(request) || handleRedirects(request);
  if (earlyExitResponse) return earlyExitResponse;

  // --- Nivel 2: Internacionalización (Establece el Contexto del Locale) ---
  const i18nResponse = handleI18n(request);
  const locale = i18nResponse.headers.get("x-app-locale") || "pt-BR";
  const pathname = getPathnameWithoutLocale(request, locale);

  // --- Nivel 3: Flujo de Selección de Idioma (Visitantes Nuevos) ---
  if (
    !request.cookies.has("NEXT_LOCALE_CHOSEN") &&
    pathname !== "/choose-language"
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/choose-language`, request.url)
    );
  }

  // --- Nivel 4: Construcción y Ejecución del Pipeline Dinámico ---
  const pipeline = new MiddlewarePipeline(request, i18nResponse);

  const isProtectedRoute = ROUTE_DEFINITIONS.protected.some((r) =>
    pathname.startsWith(r)
  );

  if (isProtectedRoute) {
    logger.trace("[PIPELINE] Ruta protegida. Usando pipeline completo.");
    pipeline.use(handleMultitenancy).use(handleAuth);
  } else {
    logger.trace(
      "[PIPELINE] Ruta pública/auth. Usando pipeline de autenticación."
    );
    pipeline.use(handleAuth);
  }

  const finalResponse = await pipeline.run();
  logger.trace(
    { status: finalResponse.status },
    "[PIPELINE] <<< FIN: Devolviendo respuesta final."
  );
  return finalResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|icons|favicon.ico|maintenance.html|browserconfig.xml|manifest.json).*)",
  ],
};

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el orquestador del middleware.
 *
 * 1.  **Registro Condicional de Manejadores:** Expandir la clase `MiddlewarePipeline` con un método `useWhen(condition, handler)`. Esto permitiría una sintaxis aún más declarativa para registrar manejadores que solo deben ejecutarse si se cumple una condición, simplificando aún más la lógica en la función `middleware` principal.
 * 2.  **Manejador de Errores del Pipeline:** Implementar un manejador de errores global para el pipeline. Se podría añadir un método `.onError(errorHandler)` a la clase `MiddlewarePipeline` que se invocaría dentro de un bloque `try/catch` en el método `run`, centralizando la gestión de fallos inesperados en los manejadores.
 * 3.  **Contexto de Petición Enriquecido:** La clase `MiddlewarePipeline` podría gestionar un objeto de contexto (`this.context`). Cada manejador podría leer y escribir en este contexto, permitiendo pasar datos enriquecidos (como la sesión del usuario o los datos del sitio) entre manejadores de forma eficiente sin tener que recalcularlos.
 */

/**
 * @fileoverview El aparato `middleware.ts` es el orquestador central del comportamiento de la aplicación en cada petición.
 * @functionality
 * - **Patrón de Pipeline Declarativo:** Implementa una clase `MiddlewarePipeline` que permite registrar manejadores de forma encadenada (`use(handler)`). Esto transforma la lógica de control de flujo de un conjunto de sentencias `if/else` a una declaración explícita del orden de ejecución, mejorando la legibilidad y la mantenibilidad.
 * - **Centralización de Rutas:** Consume el manifiesto `ROUTE_DEFINITIONS` de `lib/routing-manifest.ts` como la única fuente de verdad para la clasificación de rutas.
 * - **Ejecución Dinámica:** Basándose en la clasificación de la ruta (pública o protegida), construye dinámicamente el pipeline de manejadores apropiado para cada petición, asegurando que solo se ejecute la lógica necesaria.
 * @relationships
 * - Es el punto de entrada para todas las peticiones que coinciden con el `matcher`.
 * - Orquesta la ejecución de todos los manejadores definidos en `middleware/handlers/`.
 * - Depende del manifiesto `lib/routing-manifest.ts` para su lógica de decisión.
 * @expectations
 * - Se espera que este aparato sea una pieza de orquestación de lógica altamente fiable, declarativa y fácil de entender. Su estructura ahora facilita la adición, eliminación o reordenación de manejadores en el futuro con un riesgo mínimo de introducir regresiones.
 */
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el orquestador del middleware.
 *
 * 1.  **Clase Orquestadora de Pipeline:** Para una gestión aún más avanzada y declarativa, la lógica de encadenamiento en este archivo podría ser abstraída en una clase `MiddlewarePipeline`. Esto permitiría registrar manejadores de forma programática (ej. `pipeline.use(handleI18n).use(handleAuth).run(request)`), haciendo el orden de ejecución aún más explícito y fácil de modificar.
 * 2.  **Contexto de Petición Enriquecido:** Se podría crear un objeto de contexto (`RequestContext`) al principio del pipeline. Cada manejador podría leerlo y añadirle información (ej. sesión de usuario, datos del sitio). Esto evitaría que manejadores posteriores tengan que recalcular datos ya obtenidos, optimizando el rendimiento.
 * 3.  **Manifiesto de Rutas desde un Archivo:** Para proyectos muy grandes, el objeto `ROUTE_DEFINITIONS` podría ser extraído a su propio archivo (ej. `lib/routing-manifest.ts`) e importado aquí para mantener este archivo de orquestación lo más limpio posible.
 */

/**
 * @fileoverview El aparato `middleware.ts` es el orquestador central del comportamiento de la aplicación en cada petición.
 * @functionality
 * - **Centralización de Rutas:** Define un único manifiesto (`ROUTE_DEFINITIONS`) que es la fuente de verdad para clasificar todas las rutas de la aplicación, eliminando la duplicación y el riesgo de inconsistencia.
 * - **Pipeline Declarativo:** La lógica de ejecución es ahora más clara y declarativa. Se ejecutan secuencialmente los manejadores de terminación temprana, luego el de i18n, y finalmente, basado en una clasificación de ruta explícita, se decide qué pipeline de manejadores (protegido o público) ejecutar.
 * - **Robustez:** La función `getPathnameWithoutLocale` ha sido refinada para manejar de forma más segura la extracción del `pathname` sin el prefijo del idioma.
 * @relationships
 * - Es el punto de entrada para todas las peticiones que coinciden con el `matcher`.
 * - Orquesta la ejecución de todos los manejadores definidos en `middleware/handlers/`.
 * - (Implícitamente) Ahora dicta que el manejador `auth` ya no necesita su propia lógica de clasificación de rutas, simplificando su implementación.
 * @expectations
 * - Se espera que este aparato sea una pieza de lógica de orquestación altamente fiable y fácil de entender. Su estructura clara reduce la probabilidad de introducir bugs al modificar el flujo de peticiones. Actúa como el "controlador de tráfico aéreo" de la aplicación.
 */
//s Ruta: middleware.t
/* MEJORAS FUTURAS DETECTADAS
 * 1. Clase Orquestadora de Pipeline: Para una gestión aún más avanzada, la lógica de encadenamiento podría ser abstraída en una clase `MiddlewarePipeline` que permita registrar manejadores de forma programática (ej. `pipeline.use(handleI18n).run(request)`).
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Clase Orquestadora de Pipeline: Para una gestión aún más avanzada y declarativa, la lógica de encadenamiento en este archivo podría ser abstraída en una clase `MiddlewarePipeline`. Esto permitiría registrar manejadores de forma programática (ej. `pipeline.use(handleI18n).use(handleAuth).run(request)`), haciendo el orden de ejecución aún más explícito y fácil de modificar.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Contexto de Petición Enriquecido: En lugar de pasar solo el `locale`, se podría crear un objeto de contexto (`RequestContext`) al principio del pipeline. Cada manejador podría leerlo y añadirle información (ej. sesión de usuario, datos del sitio). Esto evitaría que manejadores posteriores tengan que recalcular datos ya obtenidos, optimizando el rendimiento.
 * 2. Inyección de Dependencias para Handlers: A medida que los manejadores se vuelvan más complejos y necesiten dependencias (como un cliente de Redis para caché), se podría implementar un pequeño sistema de inyección de dependencias para proveer estos servicios a los manejadores de forma desacoplada.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Clase Orquestadora: Para una lógica de encadenamiento más avanzada, se podría crear una clase `MiddlewarePipeline` que permita registrar manejadores y ejecute la cadena, simplificando aún más este archivo.
 * 2. Inyección de Dependencias para Handlers: En el futuro, los manejadores podrían necesitar dependencias (como un cliente de base de datos o de caché). Se podría implementar un pequeño sistema de inyección de dependencias para proveer estos servicios a los manejadores.
 * 3. Contexto de Petición: Se podría crear un objeto de contexto (`RequestContext`) que se pase a través de todos los manejadores. Esto podría contener datos enriquecidos (sesión, locale, datos del sitio) para evitar que cada manejador tenga que recalcularlos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. CACHE DE SUBDOMINIOS (CRÍTICO): La consulta `getSiteDataBySubdomain` en el middleware añade latencia. Es fundamental implementar una caché (ej. Vercel KV, Upstash Redis) para los resultados de esta consulta, invalidándola solo cuando un sitio se crea o elimina.
 * 2. Manejo de Dominios Personalizados: Expandir la lógica para que, si no se detecta un subdominio, se consulte una columna `custom_domain` en la tabla `sites`. Si se encuentra una coincidencia, se reescribe la URL al subdominio interno correspondiente.
 * 3. Firewall de IPs para Mantenimiento: La lógica actual de bypass de mantenimiento usa una cookie. Para un control más seguro, se podría leer la IP del solicitante (a través de `request.ip`) y compararla con una lista blanca de IPs de desarrolladores definida en las variables de entorno.
 */
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
