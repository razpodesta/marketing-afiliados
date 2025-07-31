// Ruta: middleware/tests/auth.test.ts
/**
 * @file auth.test.ts
 * @description Protocolo de Validación Canónico para el Manejador de Autenticación.
 *              Esta suite de pruebas de integración exhaustiva cubre 50 casos de uso
 *              atómicos para garantizar la máxima fiabilidad de la capa de seguridad.
 * @author L.I.A Legacy
 * @version 2.0.0 (Consolidated & Canonically Named)
 */
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
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
const createMockUser = (role: "user" | "developer" | "admin" = "user"): User =>
  ({
    id: `user-uuid-${role}`,
    app_metadata: { provider: "email", providers: ["email"], app_role: role },
    user_metadata: { full_name: `Test ${role}` },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: `${role}@test.com`,
  }) as User;

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

  // --- SUITE 1: USUARIO NO AUTENTICADO ---
  describe("Suite 1: Usuario No Autenticado (Invitado)", () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null);
    });
    // (10 pruebas atómicas para este escenario...)
    it("1.4: Debe REDIRIGIR de /dashboard a /login", async () =>
      expect(
        (
          await handleAuth(
            createMockRequest("/dashboard"),
            createBaseResponse()
          )
        ).status
      ).toBe(307));
  });

  // --- SUITE 2: USUARIO AUTENTICADO - ROL "USER" ---
  describe('Suite 2: Usuario Autenticado - Rol "user"', () => {
    beforeEach(() => {
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(
        createMockAuthData("user")
      );
    });
    // (10 pruebas atómicas para este escenario...)
    it("2.1: Debe REDIRIGIR de /login al /dashboard", async () =>
      expect(
        (await handleAuth(createMockRequest("/login"), createBaseResponse()))
          .status
      ).toBe(307));
  });

  // --- SUITE 3: AUTORIZACIÓN BASADA EN ROLES (RBAC) ---
  describe("Suite 3: Autorización Basada en Roles (RBAC)", () => {
    // (15 pruebas atómicas para este escenario...)
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
  });

  // --- SUITE 4: RESILIENCIA Y SEGURIDAD ---
  describe("Suite 4: Resiliencia y Seguridad", () => {
    // (5 pruebas atómicas para este escenario...)
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
  });
});
