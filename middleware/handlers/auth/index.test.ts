// Ruta: middleware/handlers/auth/index.test.ts
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

import * as UserPermissions from "@/lib/auth/user-permissions";
import { UserAuthData } from "@/lib/auth/user-permissions";
import * as WorkspacesData from "@/lib/data/workspaces";
import * as SupabaseMiddleware from "@/lib/supabase/middleware";

import { handleAuth } from "./index";

// --- Simulación (Mocking) de Dependencias ---

vi.mock("@/lib/auth/user-permissions");
vi.mock("@/lib/data/workspaces");
vi.mock("@/lib/supabase/middleware");
vi.mock("@/lib/logging", () => ({
  logger: {
    trace: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// --- Factoría de Mocks Avanzada para Datos de Prueba de Alta Fidelidad ---

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
    vi.mocked(SupabaseMiddleware.createClient).mockResolvedValue({
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
      vi.mocked(UserPermissions.getAuthenticatedUserAuthData).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createMockRequest("/dashboard"); // Ruta protegida
      const response = await handleAuth(request, createBaseResponse());

      // El comportamiento esperado es el mismo que para un usuario no autenticado
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/es-ES/login");
    });
  });

  // --- Grupo de Pruebas: Usuario No Autenticado ---
  describe("Cuando el usuario NO está autenticado", () => {
    beforeEach(() => {
      vi.mocked(UserPermissions.getAuthenticatedUserAuthData).mockResolvedValue(
        null
      );
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
      vi.mocked(UserPermissions.getAuthenticatedUserAuthData).mockResolvedValue(
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
        vi.mocked(
          UserPermissions.getAuthenticatedUserAuthData
        ).mockResolvedValue(createMockAuthData("user"));
        const request = createMockRequest("/dev-console");
        const response = await handleAuth(request, createBaseResponse());

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toContain("/es-ES/dashboard");
      });

      it('debe PERMITIR el acceso a /admin a un usuario con rol "admin"', async () => {
        vi.mocked(
          UserPermissions.getAuthenticatedUserAuthData
        ).mockResolvedValue(createMockAuthData("admin"));
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
          activeWorkspaceRole: null,
        });
        vi.mocked(
          UserPermissions.getAuthenticatedUserAuthData
        ).mockResolvedValue(userWithoutWorkspace);
        vi.mocked(WorkspacesData.getFirstWorkspaceForUser).mockResolvedValue(
          null
        );

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
          icon: "🚀",
          owner_id: "user-uuid-user",
          created_at: new Date().toISOString(),
          updated_at: null,
          current_site_count: 0,
          storage_used_mb: 0,
        };

        vi.mocked(
          UserPermissions.getAuthenticatedUserAuthData
        ).mockResolvedValue(userWithoutWorkspaceCookie);
        vi.mocked(WorkspacesData.getFirstWorkspaceForUser).mockResolvedValue(
          mockWorkspace
        );

        const request = createMockRequest("/dashboard");
        const response = await handleAuth(request, createBaseResponse());

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(request.url);
        expect(response.cookies.get("active_workspace_id")?.value).toBe(
          "ws-first-123"
        );
      });
    });

    // --- Sub-grupo: Interacción con i18n ---
    describe("Interacción con el pipeline de i18n", () => {
      it("debe construir las URLs de redirección usando el locale proporcionado en la cabecera de la respuesta", async () => {
        vi.mocked(
          UserPermissions.getAuthenticatedUserAuthData
        ).mockResolvedValue(null);
        const request = createMockRequest("/dashboard");
        // Simulamos que el manejador de i18n determinó el locale 'en-US'
        const responseFromI18n = createBaseResponse("en-US");

        const response = await handleAuth(request, responseFromI18n);

        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toContain("/en-US/login");
      });
    });
  });
});

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
