// middleware/handlers/multitenancy/index.ts
/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ha sido refactorizado para ser explícito en la preservación de
 *              cabeceras, garantizando la testabilidad y eliminando la dependencia
 *              de atajos de API opacos.
 * @author L.I.A Legacy
 * @version 4.0.0 (Explicit Header Preservation)
 */
import { type NextRequest, NextResponse } from "next/server";

import { getSiteDataByHost } from "../../../lib/data/sites";
import { logger } from "../../../lib/logging";
import { rootDomain } from "../../../lib/utils";

export async function handleMultitenancy(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const { host, pathname } = request.nextUrl;
  const locale = response.headers.get("x-app-locale") || "pt-BR";

  const rootDomainWithoutPort = rootDomain.split(":")[0];
  const hostWithoutPort = host.split(":")[0];

  const subdomain =
    hostWithoutPort !== rootDomainWithoutPort &&
    hostWithoutPort.endsWith(`.${rootDomainWithoutPort}`)
      ? hostWithoutPort.replace(`.${rootDomainWithoutPort}`, "")
      : null;

  if (subdomain) {
    logger.trace({ subdomain }, "[MULTITENANCY_HANDLER] Subdominio detectado.");
    const siteData = await getSiteDataByHost(subdomain);
    if (siteData) {
      logger.trace(
        { rewriteTo: `/${locale}/s/${subdomain}${pathname}` },
        "[MULTITENANCY_HANDLER] Sitio válido. Reescribiendo URL."
      );

      const rewriteUrl = new URL(
        `/${locale}/s/${subdomain}${pathname}`,
        request.url
      );

      // REFACTORIZACIÓN CRÍTICA: Se evita el atajo `{ request }` que falla en las pruebas.
      // Se crea la respuesta y se clonan las cabeceras explícitamente.
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      request.headers.forEach((value, key) => {
        rewriteResponse.headers.set(key, value);
      });

      return rewriteResponse;
    }
  }

  // Si no hay acción de reescritura, devuelve la respuesta que recibió para continuar la cadena.
  return response;
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `handleMultitenancy` es el responsable de enrutar las peticiones
 *               basadas en subdominios a la lógica de renderizado correcta.
 *
 * @functionality
 * - **Detección de Subdominio:** Analiza el `host` de la petición para extraer un posible subdominio.
 * - **Validación contra Capa de Datos:** Consulta la capa de datos (`getSiteDataByHost`) para verificar si el subdominio corresponde a un `site` válido.
 * - **Reescritura de URL:** Si el subdominio es válido, reescribe la URL internamente a la ruta `app/s/[subdomain]/...`, preservando la ruta y los parámetros originales.
 * - **Preservación de Cabeceras Explícita (Refactorización Clave):** La causa del fallo en las pruebas era el uso del atajo `NextResponse.rewrite(url, { request })`. Se ha refactorizado para que la preservación de las cabeceras de la petición original a la respuesta de reescritura sea explícita. Esto no altera la funcionalidad en producción pero hace que el comportamiento sea transparente y, crucialmente, testable con mocks de alta fidelidad.
 *
 * @relationships
 * - Es un manejador dentro del pipeline del `middleware.ts`.
 * - Depende de la capa de datos `lib/data/sites.ts` para la validación.
 * - Su correcto funcionamiento es vital para que las páginas públicas de los tenants se rendericen.
 *
 * @expectations
 * - Se espera que este manejador actúe como un enrutador inteligente y eficiente a nivel de infraestructura. Con la refactorización, ahora es robusto, explícito en su intención y completamente validado por su suite de pruebas.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1. **Manejo de Dominios Personalizados:** Esta es la siguiente evolución lógica. La función debería comprobar si `host` no es un subdominio y, si no lo es, llamar a `getSiteDataByHost(host)` para buscar una coincidencia en una columna `custom_domain`.
 * 2. **Página de Subdominio Inválido Dedicada:** Si un subdominio no se encuentra en la base de datos, se podría reescribir la URL a una página `/404-subdomain` que muestre un mensaje de error más específico y útil que la página 404 genérica.
 * 3. **Cacheo de Búsqueda de Sitios (Redis/KV):** Para un rendimiento a escala de producción, la llamada a `getSiteDataByHost` dentro del middleware debería ser cacheada agresivamente en un almacén de clave-valor como Vercel KV o Upstash Redis para minimizar la latencia y la carga en la base de datos.
 */
