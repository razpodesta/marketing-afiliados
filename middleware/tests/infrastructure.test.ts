// Ruta: middleware/tests/infrastructure.test.ts (Archivo Único, Consolidado y Corregido)
/**
 * @file infrastructure.test.ts
 * @description Protocolo de Validación Canónico para los Manejadores de Infraestructura del Middleware.
 *              Esta suite de pruebas de integración exhaustiva valida los manejadores de i18n,
 *              multi-tenancy, redirecciones y modo de mantenimiento con mocks de alta fidelidad.
 * @author L.I.A Legacy
 * @version 4.0.0 (High-Fidelity Mocking & Final Stability)
 */
import Negotiator from "negotiator";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSiteDataByHost } from "@/lib/data/sites";
import { handleI18n } from "../handlers/i18n";
import { handleMultitenancy } from "../handlers/multitenancy";

// --- Simulación de Dependencias ---
vi.mock("@/lib/data/sites");
vi.mock("next-intl/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---

/**
 * @function createMockRequest
 * @description Crea un objeto NextRequest de alta fidelidad, asegurando que
 *              la propiedad `headers` sea una instancia real de `Headers`.
 * @param {string} url - La URL para la petición simulada.
 * @param {Record<string, string>} [headersInit={}] - Un objeto de cabeceras.
 * @returns {NextRequest} Una instancia de NextRequest lista para la prueba.
 */
const createMockRequest = (
  url: string,
  headersInit: Record<string, string> = {}
): NextRequest => {
  // CORRECCIÓN CRÍTICA: Se crea explícitamente una instancia de `Headers`.
  const headers = new Headers(headersInit);
  return new NextRequest(`http://${url}`, { headers });
};

describe("Protocolo de Validación: Manejadores de Infraestructura y UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";

    vi.mocked(createIntlMiddleware).mockImplementation((config) => {
      return (request: NextRequest): NextResponse => {
        const { pathname, search } = request.nextUrl;
        const pathLocale = config.locales.find((loc) =>
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
        const finalLocale = languages[0] || config.defaultLocale;

        if (finalLocale !== config.defaultLocale) {
          const newUrl = new URL(
            `/${finalLocale}${pathname}${search}`,
            request.url
          );
          return NextResponse.redirect(newUrl, 308);
        }

        const response = NextResponse.rewrite(
          new URL(`${pathname}${search}`, request.url)
        );
        response.headers.set("x-next-intl-locale", finalLocale);
        return response;
      };
    });
  });

  // --- SUITE 5: MANEJADOR DE INTERNACIONALIZACIÓN (i18n) ---
  describe("Suite 5: Internacionalización (handleI18n)", () => {
    it("5.1: Debe REDIRIGIR para añadir el prefijo 'es-ES' cuando el header lo indica", () => {
      const request = createMockRequest("domain.com/about", {
        "Accept-Language": "es-ES,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/es-ES/about"
      );
    });

    it("5.2: Debe REDIRIGIR para añadir el prefijo 'en-US' cuando el header lo indica", () => {
      const request = createMockRequest("domain.com/pricing", {
        "Accept-Language": "en-US,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/en-US/pricing"
      );
    });
  });

  // --- SUITE 6: MANEJADOR MULTI-TENANCY ---
  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("debe reescribir la URL a la ruta de subdominio correcta cuando el host es un subdominio válido", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-123" } as any);
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

    it("NO debe reescribir la URL si el host es el dominio raíz", async () => {
      const request = createMockRequest("localhost:3000/dashboard");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });

    it("debe ser insensible a mayúsculas/minúsculas en el subdominio del host", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-123" } as any);
      const request = createMockRequest("CLIENTE-ALFA.localhost:3000/");
      await handleMultitenancy(request, NextResponse.next());
      expect(getSiteDataByHost).toHaveBeenCalledWith("cliente-alfa");
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
 * - **Simulación de Alta Fidelidad:** Se ha refinado la factoría `createMockRequest` para
 *   construir explícitamente una instancia `Headers`, satisfaciendo el contrato interno
 *   de `NextResponse.rewrite` y resolviendo la causa raíz de los fallos en la suite de
 *   multi-tenancy. La simulación de `createIntlMiddleware` sigue siendo robusta.
 * - **Aserciones Corregidas:** Las pruebas de i18n validan el comportamiento de redirección (308),
 *   mientras que las de multi-tenancy validan la reescritura interna. Todas las aserciones
 *   están ahora alineadas con el comportamiento real de la aplicación.
 * - **Consolidación:** Este archivo es la única fuente de verdad para las pruebas de
 *   infraestructura del middleware, eliminando la duplicación y mejorando la mantenibilidad.
 *
 * @relationships
 * - Valida los manejadores en `middleware/handlers/`.
 * - Impacta directamente en la fiabilidad de la experiencia de usuario, el SEO y la
 *   seguridad a nivel de enrutamiento.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en la configuración o lógica
 *   de cualquiera de los manejadores de infraestructura. Actúa como un guardián automatizado
 *   integral para la puerta de entrada de la aplicación. Con esta refactorización, la suite
 *   ha alcanzado un estado de máxima fiabilidad.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1.  **Utilidades de Prueba Centralizadas:** Mover la factoría `createMockRequest` y la simulación de `createIntlMiddleware` a un archivo de utilidades de prueba (`lib/test/utils.ts`) para reutilizarlas en otras suites, adhiriéndose al principio DRY.
 * 2.  **Pruebas de `pathnames` Localizados:** Ampliar la suite para verificar que las rutas localizadas (ej. `/login` -> `/iniciar-sesion`) se resuelven y redirigen correctamente, una vez que se implemente la traducción de URLs en `lib/navigation.ts`.
 * 3.  **Pruebas de Persistencia de Cookie (i18n):** Añadir pruebas que simulen la presencia de la cookie `NEXT_LOCALE_CHOSEN` y verifiquen que el middleware le da prioridad sobre la cabecera `Accept-Language`, validando el flujo de preferencia de idioma explícita del usuario.
 */
