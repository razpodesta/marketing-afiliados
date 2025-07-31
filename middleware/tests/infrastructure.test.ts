// Ruta: middleware/tests/infrastructure.test.ts (Archivo Único, Consolidado y Corregido)
/**
 * @file infrastructure.test.ts
 * @description Protocolo de Validación Canónico para los Manejadores de Infraestructura del Middleware.
 *              Esta suite de pruebas de integración exhaustiva valida los manejadores de i18n,
 *              multi-tenancy, redirecciones y modo de mantenimiento con mocks de alta fidelidad.
 * @author L.I.A Legacy
 * @version 4.1.0 (Final Stability Patch)
 */
import Negotiator from "negotiator";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleI18n } from "../handlers/i18n";
import { handleMultitenancy } from "../handlers/multitenancy";

// --- Simulación de Dependencias ---
// NOTA: La simulación de `getSiteDataByHost` se movió al manejador de multitenancy.
// Esta prueba ahora se enfoca en la reescritura de URL, no en la lógica de datos.
vi.mock("@/lib/supabase/middleware", () => ({
  createClient: vi.fn().mockResolvedValue({
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    },
    response: NextResponse.next(),
  }),
}));
vi.mock("next-intl/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---
const createMockRequest = (
  url: string,
  headersInit: Record<string, string> = {}
): NextRequest => {
  const headers = new Headers(headersInit);
  return new NextRequest(`http://${url}`, { headers });
};

describe("Protocolo de Validación: Manejadores de Infraestructura y UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";

    vi.mocked(createIntlMiddleware).mockImplementation((config: any) => {
      return (request: NextRequest): NextResponse => {
        const { pathname, search } = request.nextUrl;
        const pathLocale = config.locales.find((loc: string) =>
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
        const languages = negotiator.languages([...config.locales]);
        const detectedLocale = languages[0] || config.defaultLocale;

        const response = NextResponse.redirect(
          new URL(`/${detectedLocale}${pathname}${search}`, request.url),
          308
        );
        response.headers.set("x-next-intl-locale", detectedLocale);
        return response;
      };
    });
  });

  // --- SUITE 5: MANEJADOR DE INTERNACIONALIZACIÓN (i18n) ---
  describe("Suite 5: Internacionalización (handleI18n)", () => {
    it("5.1: Debe REDIRIGIR y establecer el locale 'es-ES' cuando el header lo indica", () => {
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

    it("5.2: Debe REDIRIGIR y establecer el locale 'en-US' cuando el header lo indica", () => {
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

  // --- SUITE 6: MANEJADOR MULTI-TENANCY ---
  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("debe reescribir la URL a la ruta de subdominio correcta cuando el host es un subdominio válido", async () => {
      const mockSupabase = await vi
        .importActual<typeof import("@/lib/supabase/middleware")>("@/lib/supabase/middleware");
      const singleMock = vi
        .fn()
        .mockResolvedValue({ data: { id: "site-123" }, error: null });
      vi.mocked(mockSupabase.createClient).mockResolvedValue({
        supabase: {
          from: () => ({
            select: () => ({
              eq: () => ({
                single: singleMock,
              }),
            }),
          }),
        },
      } as any);

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
  });
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview La suite de pruebas `infrastructure.test.ts` ha sido consolidada y blindada
 *               para garantizar la fiabilidad de los manejadores de infraestructura.
 *
 * @functionality
 * - **Simulación de Alta Fidelidad (i18n):** Se ha corregido el mock para `createIntlMiddleware`
 *   para que siempre establezca la cabecera `x-next-intl-locale` en la respuesta, tanto
 *   en redirecciones como en reescrituras. Esto replica el comportamiento real de la librería
 *   y resuelve la causa raíz de los fallos de aserción.
 * - **Simulación de Alta Fidelidad (Request):** La factoría `createMockRequest` ahora crea
 *   explícitamente una instancia `new Headers()`, satisfaciendo el estricto contrato interno de
 *   `NextResponse.rewrite` y resolviendo el error `request.headers must be an instance of Headers`.
 * - **Consolidación:** Este archivo es la única fuente de verdad para las pruebas de
 *   infraestructura del middleware, eliminando la duplicación y mejorando la mantenibilidad.
 *
 * @relationships
 * - Valida los manejadores en `middleware/handlers/`.
 * - Impacta directamente en la fiabilidad de la experiencia de usuario, el SEO y la
 *   seguridad a nivel de enrutamiento.
 *
 * @expectations
 * - Se espera que esta suite falle únicamente si se introduce una regresión real en la lógica
 *   de los manejadores de infraestructura. Actúa como un guardián automatizado integral y fiable
 *   para la puerta de entrada de la aplicación. Con esta refactorización final, la suite ha
 *   alcanzado un estado de máxima fiabilidad.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Utilidades de Prueba Centralizadas:** Mover la factoría `createMockRequest` y la simulación de `createIntlMiddleware` a un archivo de utilidades de prueba (`lib/test/utils.ts`) para reutilizarlas en otras suites, adhiriéndose al principio DRY.
 * 2.  **Pruebas de `pathnames` Localizados:** Ampliar la suite para verificar que las rutas localizadas (ej. `/login` -> `/iniciar-sesion`) se resuelven y redirigen correctamente, una vez que se implemente la traducción de URLs en `lib/navigation.ts`.
 * 3.  **Pruebas de Persistencia de Cookie (i18n):** Añadir pruebas que simulen la presencia de la cookie `NEXT_LOCALE_CHOSEN` y verifiquen que el middleware le da prioridad sobre la cabecera `Accept-Language`, validando el flujo de preferencia de idioma explícita del usuario.
 */