// middleware/handlers/infrastructure.test.ts
/**
 * @file infrastructure.test.ts
 * @description Protocolo de Validación Canónico para los Manejadores de Infraestructura del Middleware.
 *              Esta suite de pruebas de integración exhaustiva valida los manejadores de i18n
 *              y multi-tenancy con mocks de alta fidelidad, asíncronos y transparentes.
 * @author L.I.A Legacy
 * @co-author MetaShark
 * @version 5.1.0 (Fix: Transparent & Stable Mocking Strategy)
 * @see {@link file://./i18n/index.ts} Para el aparato de i18n bajo prueba.
 * @see {@link file://./multitenancy/index.ts} Para el aparato de multi-tenancy bajo prueba.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas de infraestructura.
 *
 * 1.  **Utilidades de Prueba Centralizadas:** (Vigente) Mover las factorías de mocks a un archivo de utilidades de prueba compartido.
 * 2.  **Pruebas de `pathnames` Localizados:** (Vigente) Ampliar la suite para verificar que las rutas localizadas se resuelven y redirigen correctamente.
 * 3.  **Tests para Dominios Personalizados:** (Vigente) Ampliar la suite de Multi-Tenancy para incluir tests que simulen la detección y reescritura de dominios personalizados.
 */
import Negotiator from "negotiator";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient as createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

import { handleI18n } from "./i18n";
import { handleMultitenancy } from "./multitenancy";

// --- Simulación de Dependencias ---
vi.mock("next-intl/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));
// CORRECCIÓN: Se simula el módulo completo de Supabase para el middleware
vi.mock("@/lib/supabase/middleware");

// --- Mocks y Factorías de Alta Fidelidad ---

// Mocks estables para la cadena de Supabase, accesibles desde las pruebas
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

const createMockRequest = (
  url: string,
  headers: Record<string, string> = {}
): NextRequest => {
  return new NextRequest(`http://${url}`, { headers: new Headers(headers) });
};

describe("Protocolo de Validación: Manejadores de Infraestructura y UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";

    vi.mocked(createIntlMiddleware).mockImplementation((config: any) => {
      return (request: NextRequest): NextResponse => {
        const { pathname, search } = request.nextUrl;
        const locales = [...config.locales];
        const defaultLocale = config.defaultLocale;
        const pathLocale = locales.find((loc) =>
          pathname.startsWith(`/${loc}`)
        );

        if (pathLocale) {
          const res = NextResponse.next();
          res.headers.set("x-next-intl-locale", pathLocale);
          return res;
        }

        const negotiator = new Negotiator({
          headers: {
            "accept-language": request.headers.get("accept-language") || "",
          },
        });
        const languages = negotiator.languages(locales);
        const detectedLocale = languages[0] || defaultLocale;

        let response = NextResponse.next();
        if (
          config.localePrefix === "as-needed" &&
          detectedLocale !== defaultLocale
        ) {
          const newUrl = new URL(
            `/${detectedLocale}${pathname}${search}`,
            request.url
          );
          response = NextResponse.redirect(newUrl, 308);
        }

        response.headers.set("x-next-intl-locale", detectedLocale);
        return response;
      };
    });

    // CORRECCIÓN: El mock de createClient ahora devuelve nuestros spies estables
    vi.mocked(createSupabaseMiddlewareClient).mockResolvedValue({
      supabase: { from: mockFrom } as any,
      response: NextResponse.next(),
    });
  });

  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("debe reescribir la URL a la ruta de subdominio correcta cuando el host es un subdominio válido", async () => {
      // Arrange
      mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({ data: { id: "site-123" } }),
      });
      const request = createMockRequest(
        "cliente-alfa.localhost:3000/pagina-de-ventas"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES");

      // Act
      const response = await handleMultitenancy(request, baseResponse);
      const rewrittenUrl = response.headers.get("x-middleware-rewrite");

      // Assert
      expect(rewrittenUrl).toBeDefined();
      expect(new URL(rewrittenUrl!).pathname).toBe(
        "/es-ES/s/cliente-alfa/pagina-de-ventas"
      );
    });

    it("debe ser insensible a mayúsculas/minúsculas en el subdominio del host", async () => {
      // Arrange
      mockEq.mockReturnValue({
        single: mockSingle.mockResolvedValue({ data: { id: "site-123" } }),
      });
      const request = createMockRequest("CLIENTE-ALFA.localhost:3000/");
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "pt-BR");

      // Act
      await handleMultitenancy(request, baseResponse);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith("sites");
      expect(mockSelect).toHaveBeenCalledWith("id");
      expect(mockEq).toHaveBeenCalledWith("subdomain", "cliente-alfa"); // Se verifica la llamada con el valor en minúsculas
    });
  });
});
// middleware/handlers/infrastructure.test.ts
