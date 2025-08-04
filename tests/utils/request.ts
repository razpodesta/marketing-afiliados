// tests/utils/request.ts
/**
 * @file tests/utils/request.ts
 * @description Factoría de élite para generar objetos `NextRequest` simulados.
 *              Resuelve el error `Cannot set property geo` al construir objetos
 *              inmutables que reflejan el comportamiento real del middleware.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { NextRequest, type NextMiddleware } from "next/server";
import { type IncomingHttpHeaders } from "http";
import type { Geo } from "@vercel/edge";

interface MockRequestOptions {
  url?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  ip?: string;
  geo?: Partial<Geo>;
}

/**
 * @function createMockRequest
 * @description Crea una instancia simulada de NextRequest con propiedades configurables.
 * @param {MockRequestOptions} options - Opciones para la solicitud simulada.
 * @returns {NextRequest} Una instancia de NextRequest inmutable y compatible.
 */
export function createMockRequest({
  url = "http://localhost:3000/",
  headers = {},
  cookies = {},
  ip = "127.0.0.1",
  geo = {},
}: MockRequestOptions): NextRequest {
  const req = new NextRequest(url, {
    headers: new Headers(headers),
  }) as unknown as NextRequest & {
    ip: string;
    geo: Partial<Geo> | undefined;
    cookies: NextRequest["cookies"];
  };

  // Asignar propiedades de solo lectura de forma segura al objeto de mock.
  Object.defineProperty(req, "ip", {
    value: ip,
    writable: false,
  });

  Object.defineProperty(req, "geo", {
    value: {
      ...geo,
      country: geo.country || "US",
    },
    writable: false,
  });

  // Simular cookies.
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }

  return req as NextRequest;
}
// tests/utils/request.ts
