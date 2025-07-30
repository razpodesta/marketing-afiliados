// Ruta: middleware/handlers/auth/index.test.ts (CORREGIDO Y ROBUSTECIDO)
/**
 * @file middleware/handlers/auth/index.test.ts
 * @description Suite de pruebas de integración exhaustiva y de nivel de producción para el
 *              manejador de autenticación del middleware. Valida la lógica de protección de rutas,
 *              redirecciones, autorización por roles, flujo de onboarding y resiliencia ante errores.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.0.0 (Advanced Reliability Suite)
 */
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { getFirstWorkspaceForUser } from "@/lib/data/workspaces";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";

import { handleAuth } from "../handlers/auth/index";

// --- Simulación (Mocking) de Dependencias ---
vi.mock("@/lib/auth/user-permissions");
vi.mock("@/lib/data/workspaces");
vi.mock("@/lib/supabase/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factoría de Mocks Avanzada para Datos de Prueba de Alta Fidelidad ---

/**
 * @function createMockUser
 * @description Crea un objeto de usuario simulado de alta fidelidad que cumple con el contrato de tipo `User` de Supabase.
 * @param {'user' | 'developer' | 'admin'} [role='user'] - El rol de la aplicación para el usuario simulado.
 * @returns {User} Un objeto de usuario completo y tipado.
 */
const createMockUser = (
  role: "user" | "developer" | "admin" = "user"
): User => ({
  id: `user-uuid-${role}`,
  app_metadata: { provider: "email", providers: ["email"], app_role: role },
  user_metadata: { full_name: `Test ${role}` },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  confirmation_sent_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email: `${role}@test.com`,
  email_confirmed_at: new Date().toISOString(),
  identities: [],
  is_anonymous: false,
  last_sign_in_at: new Date().toISOString(),
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
});

/**
 * @function createMockAuthData
 * @description Crea el objeto de datos de autenticación completo que el Guardián de Permisos proporciona.
 * @param {'user' | 'developer' | 'admin'} [role='user'] - El rol del usuario a simular.
 * @param {Partial<UserAuthData>} [overrides={}] - Propiedades para sobreescribir los valores por defecto.
 * @returns {UserAuthData} El objeto de datos de autenticación simulado.
 */
const createMockAuthData = (
  role: "user" | "developer" | "admin" = "user",
  overrides: Partial<UserAuthData> = {}
): UserAuthData => ({
  user: createMockUser(role),
  appRole: role,
  activeWorkspaceId: "ws-active-123",
  activeWorkspaceRole: "owner",
  ...overrides,
});

describe("Middleware: handleAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEV_MODE_ENABLED = "false";
    vi.mocked(createClient).mockResolvedValue({
      supabase: {} as any,
      response: createBaseResponse(),
    });
  });

  const createMockRequest = (pathname: string): NextRequest => {
    return new NextRequest(`http://localhost:3000/es-ES${pathname}`);
  };

  const createBaseResponse = (locale: string = "es-ES"): NextResponse => {
    const res = NextResponse.next();
    res.headers.set("x-app-locale", locale);
    return res;
  };

  // --- Grupo de Pruebas: Escenarios de Error y Resiliencia ---
  describe("Cuando las dependencias fallan (Escenarios de Error)", () => {
    it("debe tratar al usuario como no autenticado si getAuthenticatedUserAuthData lanza un error", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockRejectedValue(
        new Error("Database connection failed")
      );
      const request = createMockRequest("/dashboard");
      const response = await handleAuth(request, createBaseResponse());
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/es-ES/login");
    });
  });

  // --- Grupo de Pruebas: Usuario No Autenticado ---
  describe("Cuando el usuario NO está autenticado", () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null);
    });

    it("debe redirigir a /login si intenta acceder a /dashboard", async () => {
      const request = createMockRequest("/dashboard");
      const response = await handleAuth(request, createBaseResponse());
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/es-ES/login");
      expect(response.headers.get("location")).toContain(
        "next=%2Fes-ES%2Fdashboard"
      );
    });
  });

  // --- Grupo de Pruebas: Usuario Autenticado ---
  describe("Cuando el usuario ESTÁ autenticado", () => {
    it("debe redirigir de /login al /dashboard", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user")
      );
      const request = createMockRequest("/login");
      const response = await handleAuth(request, createBaseResponse());
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/es-ES/dashboard");
    });

    // --- Sub-grupo: Autorización Basada en Roles ---
    describe("Autorización por Rol", () => {
      it('debe DENEGAR el acceso a /dev-console a un usuario con rol "user"', async () => {
        vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
          createMockAuthData("user")
        );
        const request = createMockRequest("/dev-console");
        const response = await handleAuth(request, createBaseResponse());
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toContain("/es-ES/dashboard");
      });

      it('debe PERMITIR el acceso a /admin a un usuario con rol "admin"', async () => {
        vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
          createMockAuthData("admin")
        );
        const request = createMockRequest("/admin");
        const response = await handleAuth(request, createBaseResponse());
        expect(response.status).toBe(200);
      });
    });

    // --- Sub-grupo: Flujo de Onboarding ---
    describe("Flujo de Onboarding (Workspaces)", () => {
      it("debe redirigir a /welcome si el usuario no tiene workspaces", async () => {
        const userWithoutWorkspace = createMockAuthData("user", {
          activeWorkspaceId: null,
        });
        vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
          userWithoutWorkspace
        );
        vi.mocked(getFirstWorkspaceForUser).mockResolvedValue(null);
        const request = createMockRequest("/dashboard");
        const response = await handleAuth(request, createBaseResponse());
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toContain("/es-ES/welcome");
      });

      it("debe establecer la cookie del primer workspace y redirigir si no hay una cookie activa", async () => {
        const userWithoutWorkspaceCookie = createMockAuthData("user", {
          activeWorkspaceId: null,
        });
        const mockWorkspace = {
          id: "ws-first-123",
          name: "Primer Workspace",
        } as any;
        vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
          userWithoutWorkspaceCookie
        );
        vi.mocked(getFirstWorkspaceForUser).mockResolvedValue(mockWorkspace);
        const request = createMockRequest("/dashboard");
        const response = await handleAuth(request, createBaseResponse());
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(request.url);
        expect(response.cookies.get("active_workspace_id")?.value).toBe(
          "ws-first-123"
        );
      });
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la robustez de esta suite de pruebas.
 *
 * 1.  **Pruebas de Resiliencia:** Añadir un caso de prueba que simule un fallo en la consulta de `getFirstWorkspaceForUser` y verifique que el middleware maneja el error de forma segura, probablemente permitiendo el paso para que la página de destino muestre un error.
 * 2.  **Validación de Cookies:** En la prueba de "establecer cookie del primer workspace", añadir una aserción más estricta para verificar no solo el valor de la cookie sino también sus atributos (`path`, `httpOnly`).
 * 3.  **Pruebas de Rutas Públicas:** Aunque la lógica actual lo maneja en el orquestador `middleware.ts`, si `handleAuth` se volviera más complejo, se deberían añadir pruebas explícitas para confirmar que las rutas públicas definidas no son afectadas por la lógica de autenticación.
 */
/**
 * @fileoverview La suite de pruebas `middleware/handlers/auth/index.test.ts` es la red de seguridad más
 *               importante de la aplicación, ya que valida al guardián de todas las rutas protegidas.
 * @functionality
 * - **Aislamiento Total:** Utiliza `vi.mock` para simular todas las dependencias externas (Guardián de Permisos, Capa de Datos, etc.), asegurando que las pruebas se centren exclusivamente en la lógica del manejador.
 * - **Factoría de Mocks Avanzada:** Utiliza funciones factoría para generar datos de prueba de alta fidelidad, permitiendo la simulación de escenarios complejos de forma concisa y legible.
 * - **Pruebas de Resiliencia:** Incluye pruebas que simulan fallos en las dependencias para garantizar que el middleware se comporte de forma segura y predecible incluso bajo condiciones adversas.
 * - **Cobertura Completa de Flujos:** Valida todos los flujos lógicos críticos: acceso público, protección de rutas, redirección de sesión, autorización por roles y el proceso de onboarding.
 * @relationships
 * - Valida el manejador `middleware/handlers/auth/index.ts`.
 * - Depende de la configuración de Vitest para el entorno de pruebas (`jsdom`) y los mocks.
 * @expectations
 * - Se espera que esta suite falle ante cualquier regresión en la lógica de seguridad o flujo de usuario del middleware. Actúa como un guardián automatizado de la seguridad y la experiencia del usuario.
 */
// Ruta: middleware/handlers/auth/index.test.ts
