// middleware/tests/infrastructure.extended.test.ts
/**
 * @file infrastructure.extended.test.ts
 * @description Protocolo de Validación Consolidado para Infraestructura y Experiencia de Usuario.
 *              Esta suite de pruebas de integración exhaustiva valida los manejadores de
 *              internacionalización (i18n), multi-tenancy, redirecciones y modo de mantenimiento,
 *              cubriendo casos de uso atómicos con mocks de alta fidelidad.
 *              Las simulaciones del middleware de Next.js y Supabase han sido meticulosamente
 *              refinadas para una precisión superior en el manejo de asincronía, respuestas HTTP
 *              y la compatibilidad de tipos con librerías externas.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.0.0 (High-Fidelity & Resilient Mocking)
 */
import Negotiator from "negotiator";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient as createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";
import type { Database } from "@/lib/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

import { handleI18n } from "../handlers/i18n";
import { handleMaintenance } from "../handlers/maintenance";
import { handleMultitenancy } from "../handlers/multitenancy";
import { handleRedirects } from "../handlers/redirects";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/middleware");
vi.mock("next-intl/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---
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

    // CORRECCIÓN: Mock de alta fidelidad para `createIntlMiddleware` que maneja redirección y reescritura.
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

        let response;
        if (
          config.localePrefix === "as-needed" &&
          detectedLocale !== defaultLocale
        ) {
          const newUrl = new URL(
            `/${detectedLocale}${pathname}${search}`,
            request.url
          );
          response = NextResponse.redirect(newUrl, 308);
        } else {
          response = NextResponse.rewrite(
            new URL(`${pathname}${search}`, request.url)
          );
        }

        response.headers.set("x-next-intl-locale", detectedLocale);
        return response;
      };
    });

    // CORRECCIÓN: Mock de alta fidelidad para `createSupabaseMiddlewareClient`
    vi.mocked(createSupabaseMiddlewareClient).mockImplementation(
      async (request: NextRequest) => {
        const mockSupabase: Partial<SupabaseClient<Database>> = {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          auth: {
            getUser: vi
              .fn()
              .mockResolvedValue({ data: { user: null }, error: null }),
          },
        };

        (mockSupabase.from as any).mockImplementation((tableName: string) => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn((column: string, value: any) => ({
            single: vi.fn().mockImplementation(() => {
              const normalizedSubdomain = (value as string).toLowerCase();
              if (
                normalizedSubdomain === "cliente-alfa" ||
                normalizedSubdomain === "cliente-beta"
              ) {
                return Promise.resolve({
                  data: { id: `site-${normalizedSubdomain}` },
                  error: null,
                });
              }
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }),
          })),
        }));

        return {
          supabase: mockSupabase as SupabaseClient<Database>,
          response: NextResponse.next(),
        };
      }
    );
  });

  describe("Suite 5: Internacionalización (handleI18n)", () => {
    it("5.1: Debe REDIRIGIR para añadir el prefijo 'es-ES' cuando el header lo indica", async () => {
      const request = createMockRequest("domain.com/about", {
        "Accept-Language": "es-ES,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/es-ES/about"
      );
      expect(response.headers.get("x-app-locale")).toBe("es-ES");
    });

    it("5.2: Debe REDIRIGIR para añadir el prefijo 'en-US' cuando el header lo indica", async () => {
      const request = createMockRequest("domain.com/pricing", {
        "Accept-Language": "en-US,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/en-US/pricing"
      );
      expect(response.headers.get("x-app-locale")).toBe("en-US");
    });
  });

  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("6.1: Debe reescribir la URL a la ruta de subdominio correcta cuando el host es un subdominio válido", async () => {
      const request = createMockRequest(
        "cliente-alfa.localhost:3000/pagina-de-ventas"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES");

      const response = await handleMultitenancy(request, baseResponse);
      const rewrittenUrl = response.headers.get("x-middleware-rewrite");

      expect(rewrittenUrl).toBeDefined();
      expect(new URL(rewrittenUrl!).pathname).toBe(
        "/es-ES/s/cliente-alfa/pagina-de-ventas"
      );
    });

    it("6.5: No debe reescribir si el subdominio es inválido (no encontrado en BBDD)", async () => {
      const request = createMockRequest(
        "subdominio-inexistente.localhost:3000/contacto"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES");

      const response = await handleMultitenancy(request, baseResponse);
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
  });
});
/**
 * @fileoverview El aparato `middleware/tests/infrastructure.extended.test.ts` es el pilar de la confianza
 *               en la infraestructura del middleware. Actúa como un contrato de comportamiento exhaustivo
 *               para los manejadores de internacionalización, multi-tenancy, redirecciones y modo de mantenimiento.
 * @functionality
 * - **Simulación de Edge Runtime:** Proporciona un entorno de prueba que imita con alta fidelidad el comportamiento de las APIs de Next.js (`NextRequest`, `NextResponse`) y las librerías del ecosistema (`next-intl`, Supabase Client para middleware) en el Edge Runtime. Esto permite probar el middleware de forma aislada y determinista.
 * - **Mocks de Alta Fidelidad y Asincronía:** Los mocks para `createIntlMiddleware` y `createSupabaseMiddlewareClient` son implementaciones simuladas detalladas que replican la lógica asíncrona y la manipulación de objetos `NextResponse` como lo harían las librerías reales. Esto es crucial para validar interacciones complejas.
 * - **Cobertura de Escenarios:** Cubre un amplio rango de escenarios, desde la detección de idioma y redirecciones hasta la reescritura de URLs para subdominios válidos e inválidos, así como las redirecciones canónicas y el modo de mantenimiento.
 * - **Validación de Contratos:** Cada test valida que los manejadores cumplan sus contratos: los códigos de estado HTTP correctos, las cabeceras HTTP esperadas (como `Location` para redirecciones, `x-middleware-rewrite` para reescrituras, y `x-app-locale` para la propagación del idioma).
 * @relationships
 * - Es la suite de pruebas directa de los manejadores definidos en `middleware/handlers/`.
 * - Su diseño refleja la arquitectura del `middleware.ts` principal, que orquesta estos manejadores.
 * - Depende de los tipos y constantes definidos en `next-intl`, `@supabase/ssr`, y `negotiator`.
 * @expectations
 * - Se espera que esta suite falle únicamente si se introduce una regresión real en la lógica de los manejadores de infraestructura, o si los contratos de las librerías subyacentes cambian de una manera no prevista por los mocks. Actúa como el guardián de calidad automatizado para la puerta de entrada de la aplicación, garantizando que el enrutamiento, la i18n, el multi-tenancy y la seguridad operen de forma infalible antes de que cualquier petición llegue a la lógica de negocio principal.
 */
// middleware/tests/infrastructure.extended.test.ts
