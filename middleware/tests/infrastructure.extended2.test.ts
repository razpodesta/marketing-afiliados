// Ruta: middleware/handlers/infrastructure.extended.test.ts (NUEVO APARATO DE PRUEBAS)
/**
 * @file infrastructure.extended.test.ts
 * @description Protocolo de Validación de Infraestructura y Experiencia de Usuario.
 *              Esta suite valida los manejadores de i18n, multi-tenancy, redirecciones
 *              y modo de mantenimiento, cubriendo 50 casos de uso atómicos.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSiteDataByHost } from "@/lib/data/sites";
import { handleI18n } from "../handlers/i18n";
import { handleMaintenance } from "../handlers/maintenance";
import { handleMultitenancy } from "../handlers/multitenancy";
import { handleRedirects } from "../handlers/redirects";

// --- Simulación de Dependencias ---
vi.mock("@/lib/data/sites");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---
const createMockRequest = (
  url: string,
  headers: Record<string, string> = {}
): NextRequest => {
  return new NextRequest(`http://${url}`, { headers });
};

describe("Protocolo de Validación: Manejadores de Infraestructura y UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- SUITE 5: MANEJADOR DE INTERNACIONALIZACIÓN (i18n) (10 PRUEBAS) ---
  describe("Suite 5: Internacionalización (handleI18n)", () => {
    it('5.1: Debe detectar el locale "es-ES" del header Accept-Language', () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/", {
        "Accept-Language": "es-ES,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("es-ES");
    });
    it('5.2: Debe detectar el locale "en-US" del header', () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/", {
        "Accept-Language": "en-US,en;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("en-US");
    });
    it('5.3: Debe usar el locale por defecto "pt-BR" si el header no es compatible', () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/", {
        "Accept-Language": "fr-FR,de;q=0.9",
      });
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("pt-BR");
    });
    it('5.4: Debe usar el locale por defecto "pt-BR" si no hay header Accept-Language', () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/");
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("pt-BR");
    });
    it('5.5: Debe reescribir la URL para añadir el prefijo de locale "es-ES"', () => {
      const request = createMockRequest(
        "marketing-afiliados.vercel.app/login",
        { "Accept-Language": "es-ES" }
      );
      const response = handleI18n(request);
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/es-ES/login"
      );
    });
    it('5.6: No debe añadir prefijo a la ruta raíz "/" si el locale es el por defecto', () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/", {
        "Accept-Language": "pt-BR",
      });
      const response = handleI18n(request);
      expect(response.headers.get("x-middleware-rewrite")).not.toContain(
        "/pt-BR"
      );
    });
    it("5.7: Debe manejar correctamente las mayúsculas en el código de locale del header", () => {
      const request = createMockRequest("marketing-afiliados.vercel.app/", {
        "Accept-Language": "ES-es",
      });
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("es-ES");
    });
    it("5.8: Debe mantener los parámetros de búsqueda después de la reescritura de locale", () => {
      const request = createMockRequest(
        "marketing-afiliados.vercel.app/dashboard?param=1",
        { "Accept-Language": "en-US" }
      );
      const response = handleI18n(request);
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/en-US/dashboard?param=1"
      );
    });
    it("5.9: Debe identificar el locale desde la URL si ya está presente", () => {
      const request = createMockRequest(
        "marketing-afiliados.vercel.app/en-US/dashboard"
      );
      const response = handleI18n(request);
      expect(response.headers.get("x-app-locale")).toBe("en-US");
    });
    it("5.10: Debe redirigir si el locale en la URL no es canónico (ej. /en a /en-US)", () => {
      // Esta es una funcionalidad avanzada de next-intl que se puede habilitar
      const request = createMockRequest(
        "marketing-afiliados.vercel.app/en/dashboard"
      );
      const response = handleI18n(request);
      expect(response.status).toBe(308); // Redirección permanente
      expect(response.headers.get("location")).toContain("/en-US/dashboard");
    });
  });

  // --- SUITE 6: MANEJADOR MULTI-TENANCY (15 PRUEBAS) ---
  describe("Suite 6: Multi-Tenancy (handleMultitenancy)", () => {
    it("6.1: Debe reescribir un subdominio válido a su ruta /s/", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("cliente1.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente1/"
      );
    });
    it("6.2: Debe reescribir un subdominio válido con una ruta anidada", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("cliente2.localhost:3000/contacto");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente2/contacto"
      );
    });
    it('6.3: No debe reescribir si el subdominio es "www"', async () => {
      const request = createMockRequest("www.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
    it("6.4: No debe reescribir si no hay subdominio (dominio raíz)", async () => {
      const request = createMockRequest("localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
    it("6.5: No debe reescribir si el subdominio es inválido (no encontrado en BBDD)", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue(null);
      const request = createMockRequest("bad.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
    it("6.6: Debe preservar los parámetros de búsqueda en la reescritura", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("cliente1.localhost:3000/path?a=1&b=2");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente1/path?a=1&b=2"
      );
    });
    it("6.7: Debe manejar correctamente subdominios con guiones", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("mi-sitio-especial.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/mi-sitio-especial/"
      );
    });
    it("6.8: Debe ser insensible a mayúsculas y minúsculas en el subdominio", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("CLIENTE1.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente1/"
      );
      expect(getSiteDataByHost).toHaveBeenCalledWith("cliente1");
    });
    it("6.9 (Dominio Personalizado): Debe reescribir un dominio personalizado válido", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({
        id: "site-2",
        subdomain: "cliente-pro",
      } as any);
      const request = createMockRequest("www.cliente-pro.com/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente-pro/"
      );
    });
    it("6.10 (Dominio Personalizado): Debe reescribir con ruta y parámetros", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({
        id: "site-2",
        subdomain: "cliente-pro",
      } as any);
      const request = createMockRequest("www.cliente-pro.com/page?q=test");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/cliente-pro/page?q=test"
      );
    });
    it("6.11: Debe respetar el locale detectado por el handler i18n en la reescritura", async () => {
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("cliente1.localhost:3000/");
      const i18nResponse = NextResponse.next();
      i18nResponse.headers.set("x-app-locale", "en-US");
      const response = await handleMultitenancy(request, i18nResponse);
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/en-US/s/cliente1/"
      );
    });
    it("6.12 (Resiliencia): Debe continuar sin reescribir si getSiteDataByHost falla", async () => {
      vi.mocked(getSiteDataByHost).mockRejectedValue(
        new Error("DB connection error")
      );
      const request = createMockRequest("cliente1.localhost:3000/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
    it("6.13: No debe reescribir para assets públicos en un subdominio", async () => {
      const request = createMockRequest("cliente1.localhost:3000/favicon.ico");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false); // Asumiendo que el matcher global lo excluye
    });
    it("6.14: No debe reescribir para rutas de API en un subdominio", async () => {
      const request = createMockRequest("cliente1.localhost:3000/api/data");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    });
    it("6.15: Debe manejar correctamente un dominio raíz que contiene un subdominio en su nombre", async () => {
      // Escenario: rootDomain es "test.co" y el host es "mi-sitio.test.co"
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "test.co";
      vi.mocked(getSiteDataByHost).mockResolvedValue({ id: "site-1" } as any);
      const request = createMockRequest("mi-sitio.test.co/");
      const response = await handleMultitenancy(request, NextResponse.next());
      expect(response.headers.get("x-middleware-rewrite")).toContain(
        "/s/mi-sitio/"
      );
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost:3000"; // Reset
    });
  });

  // --- SUITE 7: MANEJADOR DE MANTENIMIENTO Y REDIRECCIONES (10 PRUEBAS) ---
  describe("Suite 7: Mantenimiento y Redirecciones Canónicas", () => {
    // Mantenimiento
    it("7.1 (Mantenimiento): Debe reescribir a /maintenance.html si el modo está activo", () => {
      process.env.MAINTENANCE_MODE = "true";
      const response = handleMaintenance(
        createMockRequest("localhost:3000/dashboard")
      );
      expect(response?.headers.get("x-middleware-rewrite")).toContain(
        "/maintenance.html"
      );
      process.env.MAINTENANCE_MODE = "false";
    });
    it("7.2 (Mantenimiento): NO debe reescribir si el modo está inactivo", () => {
      process.env.MAINTENANCE_MODE = "false";
      const response = handleMaintenance(
        createMockRequest("localhost:3000/dashboard")
      );
      expect(response).toBeNull();
    });
    it("7.3 (Mantenimiento): Debe PERMITIR acceso si la cookie de bypass está presente", () => {
      process.env.MAINTENANCE_MODE = "true";
      const request = createMockRequest("localhost:3000/dashboard");
      request.cookies.set("maintenance_bypass", "true");
      const response = handleMaintenance(request);
      expect(response).toBeNull();
      process.env.MAINTENANCE_MODE = "false";
    });
    it("7.4 (Mantenimiento): NO debe causar un bucle al acceder a /maintenance.html", () => {
      process.env.MAINTENANCE_MODE = "true";
      const response = handleMaintenance(
        createMockRequest("localhost:3000/maintenance.html")
      );
      expect(response).toBeNull();
      process.env.MAINTENANCE_MODE = "false";
    });

    // Redirecciones
    it("7.5 (Redirects): Debe redirigir de www.dominio.com a dominio.com (301)", () => {
      const response = handleRedirects(
        createMockRequest("www.marketing-afiliados.vercel.app/")
      );
      expect(response?.status).toBe(301);
      expect(response?.headers.get("location")).toBe(
        "http://marketing-afiliados.vercel.app/"
      );
    });
    it("7.6 (Redirects): Debe preservar la ruta y los parámetros en la redirección de www", () => {
      const response = handleRedirects(
        createMockRequest("www.marketing-afiliados.vercel.app/path?a=1")
      );
      expect(response?.headers.get("location")).toBe(
        "http://marketing-afiliados.vercel.app/path?a=1"
      );
    });
    it("7.7 (Redirects): NO debe redirigir si no hay www", () => {
      const response = handleRedirects(
        createMockRequest("marketing-afiliados.vercel.app/")
      );
      expect(response).toBeNull();
    });
    it('7.8 (Redirects): NO debe redirigir un subdominio que contenga "www"', () => {
      const response = handleRedirects(
        createMockRequest("www-test.marketing-afiliados.vercel.app/")
      );
      expect(response).toBeNull();
    });
    it("7.9 (Redirects): Debe funcionar con HTTPS (simulado)", () => {
      const request = new NextRequest(
        "https://www.marketing-afiliados.vercel.app/"
      );
      const response = handleRedirects(request);
      expect(response?.headers.get("location")).toBe(
        "https://marketing-afiliados.vercel.app/"
      );
    });
    it("7.10 (Redirects): NO debe redirigir para localhost", () => {
      const response = handleRedirects(
        createMockRequest("www.localhost:3000/")
      );
      expect(response).toBeNull();
    });
  });
});
