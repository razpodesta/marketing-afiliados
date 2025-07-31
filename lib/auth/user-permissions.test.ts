// Ruta: lib/auth/user-permissions.test.ts
/**
 * @file user-permissions.test.ts
 * @description Suite de pruebas de integración de alta fidelidad para el Guardián
 *              de Seguridad (`user-permissions.ts`). Esta suite ha sido refactorizada
 *              para una total seguridad de tipos y una simulación de datos robusta.
 * @author L.I.A Legacy
 * @version 1.1.0 (Type-Safe Mocking & Assertions)
 */
import { type User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import {
  clearCachedAuthData,
  getAuthenticatedUserAuthData,
  requireAppRole,
  requireWorkspacePermission,
} from "./user-permissions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn() })),
}));
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// --- Factoría de Mocks de Alta Fidelidad ---

/**
 * @function createMockUser
 * @description Crea un objeto de usuario simulado de alta fidelidad que cumple
 *              con el contrato de tipo `User` de Supabase, resolviendo el error TS2352.
 * @param {'user' | 'developer'} [role='user'] - El rol de la aplicación.
 * @returns {User} Un objeto de usuario completo y tipado.
 */
const createMockUser = (role: "user" | "developer" = "user"): User => ({
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

const mockDbClient = (responses: Record<string, any>) => {
  const from = vi.fn().mockImplementation((tableName: string) => {
    const responseData = responses[tableName] || { data: null, error: null };
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(responseData),
    };
  });
  vi.mocked(createClient).mockReturnValue({
    from,
    auth: { getUser: vi.fn() },
  } as any);
};

// --- Suite de Pruebas Principal ---
describe("Guardián de Seguridad: user-permissions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedAuthData();
  });

  describe("Función: getAuthenticatedUserAuthData", () => {
    it("debe devolver null si no hay usuario en la sesión", async () => {
      mockDbClient({});
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user: null },
      } as any);
      const result = await getAuthenticatedUserAuthData();
      expect(result).toBeNull();
    });

    it("debe devolver los datos completos para un usuario válido", async () => {
      const user = createMockUser("developer");
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user },
      } as any);
      mockDbClient({
        profiles: { data: { app_role: "developer" }, error: null },
        workspace_members: { data: { role: "owner" }, error: null },
      });
      vi.mocked(require("next/headers").cookies).mockReturnValue({
        get: () => ({ value: "ws-123" }),
      });

      const result = await getAuthenticatedUserAuthData();
      expect(result?.user.id).toBe(user.id);
      expect(result?.appRole).toBe("developer");
    });
  });

  describe("Función Guardiana: requireAppRole", () => {
    it("debe denegar el acceso si el usuario no tiene el rol requerido", async () => {
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user: createMockUser("user") },
      } as any);
      mockDbClient({ profiles: { data: { app_role: "user" }, error: null } });

      const result = await requireAppRole(["developer"]);

      // CORRECCIÓN DE TIPO (TS2339): Verificar `success` antes de acceder a `error`.
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Permiso denegado.");
      }
    });

    it("debe permitir el acceso si el usuario tiene el rol requerido", async () => {
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user: createMockUser("developer") },
      } as any);
      mockDbClient({
        profiles: { data: { app_role: "developer" }, error: null },
      });

      const result = await requireAppRole(["developer", "admin"]);

      // CORRECCIÓN DE TIPO (TS2339): Verificar `success` antes de acceder a `data`.
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.appRole).toBe("developer");
      }
    });
  });

  describe("Función Guardiana: requireWorkspacePermission", () => {
    it("debe denegar el permiso si el rol del miembro no es suficiente", async () => {
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user: createMockUser() },
      } as any);
      mockDbClient({
        profiles: { data: { app_role: "user" }, error: null },
        workspace_members: { data: { role: "member" }, error: null },
      });

      const result = await requireWorkspacePermission("ws-123", [
        "owner",
        "admin",
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No tienes permiso");
      }
    });

    it("debe conceder el permiso si el rol del miembro es suficiente", async () => {
      vi.mocked(createClient().auth.getUser).mockResolvedValue({
        data: { user: createMockUser() },
      } as any);
      mockDbClient({
        profiles: { data: { app_role: "user" }, error: null },
        workspace_members: { data: { role: "admin" }, error: null },
      });

      const result = await requireWorkspacePermission("ws-123", [
        "owner",
        "admin",
      ]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });
  });
});
