// Ruta: middleware/handlers/multitenancy.handler.ts
/**
 * @file multitenancy.handler.ts
 * @description Manejador de middleware para la lógica multi-tenant.
 * Detecta subdominios y reescribe la URL a la ruta interna correspondiente.
 *
 * @author Metashark
 * @version 1.0.0
 */
import { type NextRequest, NextResponse } from "next/server";
import { getSiteDataByHost } from "@/lib/data/sites"; // Usamos la función optimizada
import { rootDomain } from "@/lib/utils";

/**
 * @description Detecta y gestiona las peticiones a subdominios.
 * @param {NextRequest} request - La petición entrante.
 * @param {string} locale - El locale actual detectado por el middleware de i18n.
 * @returns {NextResponse | null} Una respuesta de reescritura si es un subdominio válido, o null para continuar.
 */
export async function handleMultitenancy(
  request: NextRequest,
  locale: string
): Promise<NextResponse | null> {
  const { host, pathname } = request.nextUrl;

  const rootDomainWithoutPort = rootDomain.split(":")[0];
  const hostWithoutPort = host.split(":")[0];

  const subdomain =
    hostWithoutPort !== rootDomainWithoutPort &&
    hostWithoutPort.endsWith(`.${rootDomainWithoutPort}`)
      ? hostWithoutPort.replace(`.${rootDomainWithoutPort}`, "")
      : null;

  if (subdomain) {
    const siteData = await getSiteDataByHost(subdomain);
    if (siteData) {
      return NextResponse.rewrite(
        new URL(`/${locale}/s/${subdomain}${pathname}`, request.url)
      );
    }
  }

  return null;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Manejo de Dominios Personalizados: Esta es la siguiente evolución lógica. La función debería comprobar si `host` no es un subdominio, y si no lo es, llamar a `getSiteDataByHost(host)` para buscar una coincidencia en una columna `custom_domain`.
 * 2. Página de Subdominio Inválido Dedicada: En lugar de simplemente continuar, si un subdominio no se encuentra, se podría reescribir a una página `/404-subdomain` que muestre un mensaje específico.
 * 3. Caché de Borde (Edge Caching): Como se discutió en `lib/data/sites.ts`, la implementación de una caché de borde real para `getSiteDataByHost` es la mejora de rendimiento más crítica para esta función.
 */
