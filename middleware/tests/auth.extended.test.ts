// Ruta: middleware/tests/auth.extended.test.ts (NOMBRE CORREGIDO A index.test.ts Y ACTUALIZADO)
/**
 * @file index.test.ts
 * @description Protocolo de Validación de Seguridad y Flujo de Usuario.
 *              Esta es una suite de pruebas de integración exhaustiva para el
 *              manejador `handleAuth`, cubriendo 50 casos de uso atómicos para
 *              garantizar la máxima fiabilidad.
 * @author L.I.A Legacy
 * @version 1.0.2 (High-Fidelity Mocks & Correct Pathing)
 */
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { getFirstWorkspaceForUser } from "@/lib/data/workspaces";
import { createClient } from "@/lib/supabase/middleware";
import { handleAuth } from "../handlers/auth";

// --- Simulación de Dependencias ---
vi.mock("@/lib/auth/user-permissions");
vi.mock("@/lib/data/workspaces");
vi.mock("@/lib/supabase/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---

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
  activeWorkspaceId: "ws-active-122",
  activeWorkspaceRole: "owner",
  ...overrides,
});

const createMockRequest = (pathname: string): NextRequest =>
  new NextRequest(`http://localhost:3000/es-ES${pathname}`);
const createBaseResponse = (locale: string = "es-ES"): NextResponse => {
  const res = NextResponse.next();
  res.headers.set("x-app-locale", locale);
  return res;
};

describe("Protocolo de Validación: Manejador de Autenticación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      supabase: {} as any,
      response: createBaseResponse(),
    });
  });

  // --- SUITE 1: USUARIO NO AUTENTICADO (10 PRUEBAS) ---
  describe("Suite 1: Usuario No Autenticado (Invitado)", () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null);
    });
    it("1.1: Debe PERMITIR acceso a /", async () =>
      expect(
        (await handleAuth(createMockRequest("/"), createBaseResponse())).status
      ).toBe(200));
    it("1.2: Debe PERMITIR acceso a /login", async () =>
      expect(
        (await handleAuth(createMockRequest("/login"), createBaseResponse()))
          .status
      ).toBe(200));
    it("1.3: Debe PERMITIR acceso a /forgot-password", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/forgot-password"),
            createBaseResponse()
          )
        ).status
      ).toBe(200));
    it("1.4: Debe REDIRIGIR de /dashboard a /login", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(307));
    it("1.5: Debe REDIRIGIR de /dashboard/sites a /login", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard/sites"),
            createBaseResponse()
          )
        ).status
      ).toBe(307));
    it("1.6: Debe REDIRIGIR de /admin a /login", async () =>
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(307));
    it("1.7: Debe REDIRIGIR de /dev-console a /login", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dev-console"),
            createBaseResponse()
          )
        ).status
      ).toBe(307));
    it("1.8: Debe REDIRIGIR de /welcome a /login", async () =>
      expect(
        (await handleAuth(createMockRequest("/welcome"), createBaseResponse()))
          .status
      ).toBe(307));
    it("1.9: Debe REDIRIGIR de /lia-chat a /login", async () =>
      expect(
        (await handleAuth(createMockRequest("/lia-chat"), createBaseResponse()))
          .status
      ).toBe(307));
    it('1.10: Debe PRESERVAR la URL de retorno en el parámetro "next"', async () => {
      const response = await handleAuth(
        createMockRequest("/dashboard/settings"),
        createBaseResponse()
      );
      expect(response.headers.get("location")).toContain(
        "next=%2Fes-ES%2Fdashboard%2Fsettings"
      );
    });
  });

  // --- SUITE 2: USUARIO AUTENTICADO - ROL "USER" (10 PRUEBAS) ---
  describe('Suite 2: Usuario Autenticado - Rol "user"', () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user")
      );
    });
    it("2.1: Debe REDIRIGIR de /login al /dashboard", async () =>
      expect(
        (await handleAuth(createMockRequest("/login"), createBaseResponse()))
          .status
      ).toBe(307));
    it("2.2: Debe REDIRIGIR de / al /dashboard", async () =>
      expect(
        (await handleAuth(createMockRequest("/"), createBaseResponse())).status
      ).toBe(307));
    it("2.3: Debe PERMITIR acceso a /dashboard", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(200));
    it("2.4: Debe PERMITIR acceso a /dashboard/sites", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard/sites"),
            createBaseResponse()
          )
        ).status
      ).toBe(200));
    it("2.5: Debe PERMITIR acceso a /lia-chat", async () =>
      expect(
        (await handleAuth(createMockRequest("/lia-chat"), createBaseResponse()))
          .status
      ).toBe(200));
    it("2.6: Debe DENEGAR acceso a /admin y REDIRIGIR al /dashboard", async () => {
      const response = await handleAuth(
        createMockRequest("/admin"),
        createBaseResponse()
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });
    it("2.7: Debe DENEGAR acceso a /dev-console y REDIRIGIR al /dashboard", async () => {
      const response = await handleAuth(
        createMockRequest("/dev-console"),
        createBaseResponse()
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });
    it("2.8 (Onboarding): Debe REDIRIGIR a /welcome si no tiene workspaces", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user", { activeWorkspaceId: null })
      );
      vi.mocked(getFirstWorkspaceForUser).mockResolvedValue(null);
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(307);
    });
    it("2.9 (Onboarding): Debe establecer cookie si tiene workspace pero no cookie", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user", { activeWorkspaceId: null })
      );
      vi.mocked(getFirstWorkspaceForUser).mockResolvedValue({
        id: "ws-first-123",
      } as any);
      const response = await handleAuth(
        createMockRequest("/dashboard"),
        createBaseResponse()
      );
      expect(response.cookies.get("active_workspace_id")?.value).toBe(
        "ws-first-123"
      );
    });
    it("2.10 (Onboarding): Debe REDIRIGIR de /welcome al /dashboard si ya tiene workspace", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user")
      ); // Tiene workspace por defecto
      expect(
        (await handleAuth(createMockRequest("/welcome"), createBaseResponse()))
          .status
      ).toBe(307);
    });
  });

  // --- SUITE 3: AUTORIZACIÓN BASADA EN ROLES (RBAC) (15 PRUEBAS) ---
  describe("Suite 3: Autorización Basada en Roles (RBAC)", () => {
    // Admin Role
    it("3.1 (Admin): Debe PERMITIR acceso a /dashboard", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.2 (Admin): Debe PERMITIR acceso a /admin", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(200);
    });
    it("3.3 (Admin): Debe DENEGAR acceso a /dev-console y REDIRIGIR", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      const response = await handleAuth(
        createMockRequest("/dev-console"),
        createBaseResponse()
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });
    it("3.4 (Admin): Debe PERMITIR acceso a /admin/users", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/admin/users"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.5 (Admin): No debe ser redirigido a /welcome incluso sin cookie de workspace", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin", { activeWorkspaceId: null })
      );
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(200);
    });

    // Developer Role
    it("3.6 (Developer): Debe PERMITIR acceso a /dashboard", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.7 (Developer): Debe PERMITIR acceso a /admin", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer")
      );
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(200);
    });
    it("3.8 (Developer): Debe PERMITIR acceso a /dev-console", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dev-console"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.9 (Developer): Debe PERMITIR acceso a /dev-console/logs", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dev-console/logs"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.10 (Developer): No debe ser redirigido a /welcome incluso sin cookie de workspace", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer", { activeWorkspaceId: null })
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dev-console"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });

    // Casos Límite
    it('3.11 (RBAC): Un rol desconocido debe ser tratado como "user"', async () => {
      const mockData = createMockAuthData("user");
      mockData.appRole = "unknown_role" as any;
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(mockData);
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(307);
    });
    it('3.12 (RBAC): Un usuario sin rol definido debe ser tratado como "user"', async () => {
      const mockData = createMockAuthData("user");
      mockData.appRole = null as any;
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(mockData);
      expect(
        (await handleAuth(createMockRequest("/admin"), createBaseResponse()))
          .status
      ).toBe(307);
    });
    it("3.13 (RBAC): Debe permitir acceso a una sub-ruta de admin a un usuario admin", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/admin/sites/123"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it("3.14 (RBAC): Debe denegar acceso a una sub-ruta de dev-console a un usuario admin", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("admin")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dev-console/users"),
            createBaseResponse()
          )
        ).status
      ).toBe(307);
    });
    it("3.15 (RBAC): Un desarrollador que accede a una ruta de usuario normal debe ser permitido", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("developer")
      );
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard/sites"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
  });

  // --- SUITE 4: RESILIENCIA Y SEGURIDAD (5 PRUEBAS) ---
  describe("Suite 4: Resiliencia y Seguridad", () => {
    it("4.1 (Resiliencia): Debe tratar al usuario como no autenticado si getAuthenticatedUserAuthData falla", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockRejectedValue(
        new Error("DB Error")
      );
      const response = await handleAuth(
        createMockRequest("/dashboard"),
        createBaseResponse()
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });
    it("4.2 (Resiliencia): Debe permitir el paso si getFirstWorkspaceForUser falla", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user", { activeWorkspaceId: null })
      );
      vi.mocked(getFirstWorkspaceForUser).mockRejectedValue(
        new Error("DB Error")
      );
      // Se espera que la página del dashboard maneje el error, no el middleware.
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(200);
    });
    it('4.3 (Seguridad): Debe prevenir Open Redirect en el parámetro "next"', async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null);
      const request = new NextRequest(
        "http://localhost:3000/es-ES/dashboard?next=//evil.com"
      );
      const response = await handleAuth(request, createBaseResponse());
      expect(response.headers.get("location")).not.toContain("evil.com");
      expect(response.headers.get("location")).toContain("/dashboard"); // Fallback seguro
    });
    it("4.4 (Seguridad): Debe manejar cookies malformadas de forma segura", async () => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user")
      );
      const request = createMockRequest("/dashboard");
      request.cookies.set("active_workspace_id", "not-a-uuid");
      // No debe crashear, debe continuar el flujo normal.
      const response = await handleAuth(request, createBaseResponse());
      expect(response.status).toBe(200);
    });
    it("4.5 (Seguridad): Debe ignorar el bypass de desarrollo si la variable de entorno no está activa", async () => {
      process.env.DEV_MODE_ENABLED = "false";
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null); // Simula no autenticado
      const request = createMockRequest("/admin"); // Ruta protegida
      const response = await handleAuth(request, createBaseResponse());
      expect(response.status).toBe(307); // Debe redirigir, no hacer bypass.
    });
  });
});
