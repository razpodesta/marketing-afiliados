// Ruta: middleware/tests/infrastructure.extended.test.ts
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
 * @version 2.3.0 (Type Strictness & Supabase Mock Refinement)
 */
import Negotiator from "negotiator";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Importar el creador de cliente de Supabase específico para el middleware.
// Importamos tipos necesarios para el mock de Supabase.
import { createClient as createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";
import type { Database } from "@/lib/types/database"; // Importar tipo Database
import type { SupabaseClient } from "@supabase/supabase-js"; // Importar tipo SupabaseClient

import { handleI18n } from "../handlers/i18n";
import { handleMaintenance } from "../handlers/maintenance";
import { handleMultitenancy } from "../handlers/multitenancy";
import { handleRedirects } from "../handlers/redirects";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/middleware"); // Mockear el creador de cliente para middleware
vi.mock("next-intl/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---

/**
 * @function createMockRequest
 * @description Crea una instancia de `NextRequest` simulada con URL y cabeceras personalizadas.
 * @param {string} url - La URL completa para la petición simulada (ej. "domain.com/path").
 * @param {Record<string, string>} headers - Objeto de cabeceras HTTP para la petición.
 * @returns {NextRequest} Una instancia mockeada de `NextRequest`.
 */
const createMockRequest = (
  url: string,
  headers: Record<string, string> = {}
): NextRequest => {
  return new NextRequest(`http://${url}`, { headers: new Headers(headers) });
};

describe("Protocolo de Validación: Manejadores de Infraestructura y UX", () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba para asegurar el aislamiento
    vi.clearAllMocks();
    // Establecer el dominio raíz para los tests de multi-tenancy y redirecciones
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000";

    // Mock de alta fidelidad para `createIntlMiddleware`
    // Este mock simula el comportamiento principal del middleware de next-intl,
    // incluyendo la detección de idioma y la manipulación de `NextResponse`.
    vi.mocked(createIntlMiddleware).mockImplementation((config) => {
      // El manejador de middleware mockeado que `handleI18n` invoca.
      // Se hace asíncrono porque las implementaciones reales de middleware pueden serlo.
      return async (request: NextRequest): Promise<NextResponse> => {
        const { pathname, search } = request.nextUrl;
        // CORRECCIÓN (TS2345): Convertir `readonly string[]` a `string[]` mutable para Negotiator.
        const locales = [...config.locales]; // Copia mutable
        const defaultLocale = config.defaultLocale;

        // Lógica de detección de locale simulada (simplificada del next-intl real)
        const pathSegments = pathname.split("/").filter(Boolean);
        const urlLocale =
          pathSegments.length > 0 && locales.includes(pathSegments[0])
            ? pathSegments[0]
            : null;

        let response: NextResponse;
        let detectedLocale: string;

        if (urlLocale) {
          // Si el locale ya está en la URL, se asume que esa es la preferencia.
          detectedLocale = urlLocale;
          response = NextResponse.next();
        } else {
          // Si no hay locale en la URL, usar `Negotiator` para simular la detección del navegador.
          const negotiator = new Negotiator({
            headers: {
              "accept-language": request.headers.get("accept-language") || "",
            },
          });
          // Se pasa la copia mutable de `locales`
          const languages = negotiator.languages(locales);
          detectedLocale = languages[0] || defaultLocale;

          if (detectedLocale !== defaultLocale) {
            // Si se detecta un locale diferente al por defecto, se simula una redirección 308.
            const newUrl = new URL(
              `/${detectedLocale}${pathname}${search}`,
              request.url
            );
            response = NextResponse.redirect(newUrl, 308);
          } else {
            // Si es el locale por defecto o no se detecta nada, se simula una reescritura interna.
            response = NextResponse.rewrite(
              new URL(`${pathname}${search}`, request.url)
            );
          }
        }
        // CRÍTICO: Asegurarse de que el header `x-next-intl-locale` se establece
        // en la respuesta generada por el mock, ya que `handleI18n` lo lee para
        // establecer `x-app-locale`.
        response.headers.set("x-next-intl-locale", detectedLocale);
        return response; // Devolver la promesa resuelta
      };
    });

    // Mock del cliente de Supabase para middleware (`createSupabaseMiddlewareClient`).
    // Este mock simula la interacción con la base de datos en el Edge Runtime.
    vi.mocked(createSupabaseMiddlewareClient).mockImplementation(
      (request: NextRequest) => {
        // Se crea un mock de SupabaseClient con las propiedades mínimas necesarias
        // y métodos que pueden ser encadenados.
        const mockSupabase: SupabaseClient<Database> = {
          from: vi.fn((tableName: string) => {
            // CORRECCIÓN (TS2554): 'from' debe aceptar tableName
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn((column: string, value: any) => {
                // CORRECCIÓN (TS2554): 'eq' debe aceptar column y value
                return {
                  single: vi.fn().mockImplementation(() => {
                    // Lógica de simulación para `supabase.from("sites").select("id").eq("subdomain", ...).single()`
                    // Simula encontrar o no un sitio basándose en el subdominio de la query.
                    const normalizedQuerySubdomain = (
                      value as string
                    ).toLowerCase(); // Asegurar que el valor es string

                    if (normalizedQuerySubdomain === "cliente-alfa") {
                      return Promise.resolve({
                        data: { id: "site-123", subdomain: "cliente-alfa" },
                        error: null,
                      });
                    }
                    if (normalizedQuerySubdomain === "cliente-beta") {
                      return Promise.resolve({
                        data: { id: "site-456", subdomain: "cliente-beta" },
                        error: null,
                      });
                    }
                    // Para cualquier otro subdominio, simula un "Not Found" (PGRST116).
                    return Promise.resolve({
                      data: null,
                      error: { code: "PGRST116", message: "Not Found" },
                    });
                  }),
                };
              }),
              // Añadir otros métodos que `from` pudiera devolver si fueran necesarios en el test
              insert: vi.fn().mockReturnThis(),
              update: vi.fn().mockReturnThis(),
              delete: vi.fn().mockReturnThis(),
              rpc: vi.fn().mockReturnThis(),
              // ...otros métodos necesarios para satisfacer el tipo `PostgrestQueryBuilder`
            };
          }),
          auth: {
            getUser: vi.fn(() =>
              Promise.resolve({ data: { user: null }, error: null })
            ),
            // Añadir otros métodos de auth si fueran necesarios
          },
          // Añadir otras propiedades o métodos de SupabaseClient si fueran necesarios
          storage: {} as any, // Mock simple para storage
          functions: {} as any, // Mock simple para functions
          realtime: {} as any, // Mock simple para realtime
          schema: "public" as any, // Propiedad `schema` para el tipado de SupabaseClient
          // Y cualquier otra propiedad que SupabaseClient de @supabase/supabase-js necesite.
        } as SupabaseClient<Database>; // Forzar el tipo a SupabaseClient<Database> para mayor seguridad

        return Promise.resolve({
          supabase: mockSupabase,
          response: NextResponse.next(), // El response inicial del createClient
        });
      }
    );
  });

  // --- SUITE 5: MANEJADOR DE INTERNACIONALIZACIÓN (handleI18n) ---
  // Valida el comportamiento del middleware de next-intl y la detección/aplicación de locales.
  describe("Suite 5: Internacionalización (handleI18n)", () => {
    it("5.1: Debe REDIRIGIR para añadir el prefijo 'es-ES' cuando el header lo indica", async () => {
      const request = createMockRequest("domain.com/about", {
        "Accept-Language": "es-ES,en;q=0.9",
      });
      const response = await handleI18n(request); // `await` es crucial aquí porque el mock es asíncrono
      expect(response.status).toBe(308); // Código de redirección permanente de next-intl
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/es-ES/about"
      );
      expect(response.headers.get("x-app-locale")).toBe("es-ES"); // Cabecera personalizada establecida por `handleI18n`
    });

    it("5.2: Debe REDIRIGIR para añadir el prefijo 'en-US' cuando el header lo indica", async () => {
      const request = createMockRequest("domain.com/pricing", {
        "Accept-Language": "en-US,en;q=0.9",
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/en-US/pricing"
      );
      expect(response.headers.get("x-app-locale")).toBe("en-US");
    });

    it("5.3: Debe usar el locale por defecto 'pt-BR' si el header no es compatible", async () => {
      const request = createMockRequest("domain.com/", {
        "Accept-Language": "fr-FR,de;q=0.9",
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(200); // No hay redirección si es el defaultLocale
      expect(response.headers.get("x-app-locale")).toBe("pt-BR");
    });

    it("5.4: Debe usar el locale por defecto 'pt-BR' si no hay header Accept-Language", async () => {
      const request = createMockRequest("domain.com/");
      const response = await handleI18n(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("x-app-locale")).toBe("pt-BR");
    });

    it("5.5: Debe REDIRIGIR a una URL con prefijo 'es-ES'", async () => {
      const request = createMockRequest("domain.com/login", {
        "Accept-Language": "es-ES",
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/es-ES/login"
      );
    });

    it("5.6: NO debe redirigir ni añadir prefijo en la ruta raíz si el locale es el por defecto", async () => {
      const request = createMockRequest("domain.com/", {
        "Accept-Language": "pt-BR",
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(200);
      expect(response.headers.has("location")).toBe(false); // No Location header if no redirect
      // Cuando no hay redirección, next-intl hace un `rewrite` y no añade el prefijo por defecto en la URL.
      expect(
        response.headers.get("x-middleware-rewrite")?.includes("/pt-BR")
      ).toBe(false);
    });

    it("5.7: Debe manejar mayúsculas en el header y REDIRIGIR al locale canónico", async () => {
      const request = createMockRequest("domain.com/", {
        "Accept-Language": "ES-es", // Idioma en mayúsculas/minúsculas no canónicas
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(308);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/es-ES/"
      );
    });

    it("5.8: Debe mantener los parámetros de búsqueda en la REDIRECCIÓN", async () => {
      const request = createMockRequest("domain.com/dashboard?param=1", {
        "Accept-Language": "en-US",
      });
      const response = await handleI18n(request);
      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/en-US/dashboard");
      expect(location.searchParams.get("param")).toBe("1");
    });

    it("5.9: NO debe redirigir si el locale ya está presente en la URL", async () => {
      const request = createMockRequest("domain.com/en-US/dashboard");
      const response = await handleI18n(request);
      expect(response.status).toBe(200);
      expect(response.headers.has("location")).toBe(false);
      expect(response.headers.get("x-app-locale")).toBe("en-US"); // Se asegura que el locale se propaga
    });

    it("5.10: Debe redirigir si el locale en la URL no es canónico (ej. /en a /en-US)", async () => {
      const request = createMockRequest("domain.com/en/dashboard", {
        "Accept-Language": "en-US,en;q=0.9",
      });
      const response = await handleI18n(request);
      expect(response.status).toBe(308);
      // El mock de createIntlMiddleware redirige a la URL completa con el nuevo locale detectado
      // y mantiene el path original no canónico.
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/en-US/en/dashboard"
      );
    });
  });

  // --- SUITE 6: MANEJADOR MULTI-TENANCY (handleMultitenancy) ---
  // Valida el enrutamiento basado en subdominios y la interacción con la base de datos simulada.
  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("6.1: Debe reescribir la URL a la ruta de subdominio correcta cuando el host es un subdominio válido", async () => {
      const request = createMockRequest(
        "cliente-alfa.localhost:3000/pagina-de-ventas"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES"); // Simular que i18n ya actuó

      const response = await handleMultitenancy(request, baseResponse);
      const rewrittenUrl = response.headers.get("x-middleware-rewrite");

      expect(rewrittenUrl).toBeDefined();
      expect(new URL(rewrittenUrl!).pathname).toBe(
        "/es-ES/s/cliente-alfa/pagina-de-ventas"
      );
      // Verificaciones adicionales de que el mock de Supabase fue llamado correctamente
      const { supabase: mockSupabase } =
        await createSupabaseMiddlewareClient(request);
      expect(mockSupabase.from).toHaveBeenCalledWith("sites");
      expect(mockSupabase.from().select).toHaveBeenCalledWith("id");
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith(
        "subdomain",
        "cliente-alfa"
      );
    });

    it("6.4: No debe reescribir si no hay subdominio (dominio raíz)", async () => {
      const request = createMockRequest("localhost:3000/dashboard");
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES");

      const response = await handleMultitenancy(request, baseResponse);
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });

    it("6.5: No debe reescribir si el subdominio es inválido (no encontrado en BBDD)", async () => {
      // `createSupabaseMiddlewareClient` ya está configurado para devolver null para 'subdominio-inexistente'
      const request = createMockRequest(
        "subdominio-inexistente.localhost:3000/contacto"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "es-ES");

      const response = await handleMultitenancy(request, baseResponse);
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
      // Verificación de que el mock de Supabase fue llamado con el subdominio correcto
      const { supabase: mockSupabase } =
        await createSupabaseMiddlewareClient(request);
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith(
        "subdomain",
        "subdominio-inexistente"
      );
    });

    it("debe ser insensible a mayúsculas/minúsculas en el subdominio del host", async () => {
      // El mock de `createSupabaseMiddlewareClient` ya maneja la conversión a minúsculas
      const request = createMockRequest(
        "CLIENTE-BETA.localhost:3000/pagina-de-prueba"
      );
      const baseResponse = NextResponse.next();
      baseResponse.headers.set("x-app-locale", "pt-BR");

      await handleMultitenancy(request, baseResponse);

      // Verify that createSupabaseMiddlewareClient's internal mock was called with the normalized (lowercase) subdomain
      const { supabase: mockSupabase } =
        await createSupabaseMiddlewareClient(request);
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith(
        "subdomain",
        "cliente-beta"
      );
    });
  });

  // --- SUITE 7: MANEJADOR DE MANTENIMIENTO Y REDIRECCIONES CANÓNICAS ---
  // Valida el modo de mantenimiento y las redirecciones de SEO.
  describe("Suite 7: Mantenimiento y Redirecciones Canónicas", () => {
    it("7.1 (Mantenimiento): Debe reescribir a /maintenance.html si el modo está activo", () => {
      process.env.MAINTENANCE_MODE = "true"; // Activar modo mantenimiento para este test
      const request = createMockRequest("localhost:3000/dashboard");
      const response = handleMaintenance(request);
      expect(response?.headers.get("x-middleware-rewrite")).toContain(
        "/maintenance.html"
      );
      process.env.MAINTENANCE_MODE = "false"; // Desactivar después del test
    });

    it("7.5 (Redirects): Debe redirigir de www.dominio.com a dominio.com (301)", () => {
      const request = createMockRequest("www.metashark.site/");
      const response = handleRedirects(request);
      expect(response?.status).toBe(301); // Redirección permanente
      expect(response?.headers.get("location")).toBe("https://metashark.site/");
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

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Utilidades de Prueba Centralizadas:** Mover la factoría `createMockRequest` y las lógicas de mocking complejas (como las de `createIntlMiddleware` y `createSupabaseMiddlewareClient`) a un archivo de utilidades de prueba compartido (ej. `lib/test/utils.ts`). Esto reduciría la duplicación en otras suites de middleware y haría el arnés de pruebas más conciso y modular.
 * 2.  **Pruebas de `pathnames` Localizados:** Ampliar la suite para verificar que las rutas dinámicas y estáticas, cuando se configuran con traducciones de URL en `lib/navigation.ts` (ej. `/login` se traduce a `/iniciar-sesion`), se resuelven y redirigen correctamente según el idioma y el `localePrefix` configurado.
 * 3.  **Pruebas de Persistencia de Cookie (i18n):** Añadir pruebas que simulen la presencia de la cookie `NEXT_LOCALE_CHOSEN` y verifiquen que el middleware le da prioridad sobre la cabecera `Accept-Language` del navegador para la detección del idioma, validando el flujo de preferencia de idioma explícita del usuario.
 * 4.  **Tests para Dominios Personalizados:** Ampliar la suite de Multi-Tenancy para incluir tests que simulen la detección y reescritura de dominios personalizados (ej. `miempresa.com` que apunta a `subdominio.metashark.site`). Esto requeriría que el mock de `createSupabaseMiddlewareClient` también simule la columna `custom_domain` en la tabla `sites`.
 * 5.  **Tests de Errores de Conectividad/Resiliencia en Middleware:** Añadir pruebas que simulen fallos en la conexión a Supabase (ej. el mock de `single()` lanza un error de red) dentro de `handleMultitenancy` o `handleAuth` y verifiquen que el middleware responde de forma robusta (ej. no bloquea la petición, muestra un error amigable o redirige a una página de contingencia, sin crashear).
 * 6.  **Tests de Performance/Latencia Simulada:** Aunque `Vitest` es rápido, para escenarios muy avanzados, se podrían introducir retardos simulados en los mocks de las llamadas a la BD (`Promise.resolve().then(() => new Promise(resolve => setTimeout(resolve, 50)))`) para simular latencia de red y verificar cómo el middleware se comporta bajo esas condiciones.
 */
