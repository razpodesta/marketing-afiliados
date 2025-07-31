// middleware/handlers/multitenancy/index.ts
/**
 * @file middleware/handlers/multitenancy/index.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 *              Ha sido refactorizado para ser autónomo y compatible con el Edge Runtime,
 *              utilizando el cliente de Supabase para middleware y eliminando
 *              dependencias a la capa de datos del servidor.
 * @author L.I.A Legacy
 * @version 4.1.0 (Edge Runtime Compatibility)
 */
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "../../../../lib/logging";
// Se importa el cliente de Supabase específico para el middleware.
import { createClient } from "../../../../lib/supabase/middleware";
import { rootDomain } from "../../../../lib/utils";

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

    // Se utiliza el cliente de Supabase del middleware para la consulta.
    const { supabase } = await createClient(request);
    const { data: siteData, error } = await supabase
      .from("sites")
      .select("id")
      .eq("subdomain", subdomain)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error(
        `[MULTITENANCY_HANDLER] Error al buscar sitio ${subdomain}:`,
        error
      );
    }

    if (siteData) {
      logger.trace(
        { rewriteTo: `/${locale}/s/${subdomain}${pathname}` },
        "[MULTITENANCY_HANDLER] Sitio válido. Reescribiendo URL."
      );

      const rewriteUrl = new URL(
        `/${locale}/s/${subdomain}${pathname}`,
        request.url
      );

      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      request.headers.forEach((value, key) => {
        rewriteResponse.headers.set(key, value);
      });

      return rewriteResponse;
    }
  }

  return response;
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `handleMultitenancy` es el responsable de enrutar las peticiones
 *               basadas en subdominios a la lógica de renderizado correcta dentro del Edge.
 *
 * @functionality
 * - **Detección de Subdominio:** Analiza el `host` de la petición para extraer un posible subdominio.
 * - **Validación Edge-Compatible (Refactorización Clave):** La causa de las advertencias
 *   críticas era la importación de una función de la capa de datos (`"use server"`) dentro
 *   de un entorno Edge (`middleware`). La refactorización ha eliminado esta dependencia
 *   y ha replicado la lógica de consulta directamente en el manejador, pero utilizando el
 *   cliente de Supabase específico para middleware, que es compatible con el Edge Runtime.
 *   Esto resuelve la violación arquitectónica y previene fallos en producción.
 * - **Reescritura de URL:** Si el subdominio es válido, reescribe la URL internamente a la ruta
 *   `app/s/[subdomain]/...`, preservando la ruta y las cabeceras originales.
 *
 * @relationships
 * - Es un manejador dentro del pipeline del `middleware.ts`.
 * - Interactúa directamente con la base de datos a través del `lib/supabase/middleware.ts`.
 * - Su correcto funcionamiento es vital para que las páginas públicas de los tenants se rendericen.
 *
 * @expectations
 * - Se espera que este manejador actúe como un enrutador inteligente y eficiente a nivel de
 *   infraestructura, respetando los límites de los runtimes de Next.js. Con la refactorización,
 *   ahora es robusto, arquitectónicamente correcto y funcional en el entorno de producción.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1. **Manejo de Dominios Personalizados:** Esta es la siguiente evolución lógica. La función debería comprobar si `host` no es un subdominio y, si no lo es, llamar a una consulta similar para buscar una coincidencia en una columna `custom_domain`.
 * 2. **Página de Subdominio Inválido Dedicada:** Si un subdominio no se encuentra en la base de datos, se podría reescribir la URL a una página `/404-subdomain` que muestre un mensaje de error más específico y útil que la página 404 genérica.
 * 3. **Cacheo de Búsqueda de Sitios (Redis/KV):** Para un rendimiento a escala de producción, la consulta a la base de datos dentro del middleware debería ser cacheada agresivamente en un almacén de clave-valor como Vercel KV o Upstash Redis para minimizar la latencia y la carga en la base de datos.
 */
