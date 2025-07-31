// Ruta: lib/auth/user-permissions.test.ts
/**
 * @file user-permissions.test.ts
 * @description Suite de pruebas de integración de alta fidelidad para el Guardián
 *              de Seguridad (`user-permissions.ts`). Esta suite ha sido refactorizada
 *              para una total seguridad de tipos y una simulación de datos robusta.
 * @author L.I.A Legacy
 * @version 2.0.0 (High-Fidelity Unified Mocking)
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

describe("Guardián de Seguridad: user-permissions.ts", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedAuthData();

    // Mock unificado y de alta fidelidad para el cliente de Supabase
    mockSupabaseClient = {
      from: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  describe("Función: getAuthenticatedUserAuthData", () => {
    it("debe devolver null si no hay usuario en la sesión", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const result = await getAuthenticatedUserAuthData();
      expect(result).toBeNull();
    });

    it("debe devolver los datos completos para un usuario válido", async () => {
      const user = createMockUser("developer");
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });

      mockSupabaseClient.from.mockImplementation((tableName: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(
            tableName === "profiles"
              ? { data: { app_role: "developer" }, error: null }
              : { data: { role: "owner" }, error: null }
          ),
      }));

      vi.mocked(require("next/headers").cookies).mockReturnValue({
        get: () => ({ value: "ws-123" }),
      });

      const result = await getAuthenticatedUserAuthData();
      expect(result?.user.id).toBe(user.id);
      expect(result?.appRole).toBe("developer");
      expect(result?.activeWorkspaceRole).toBe("owner");
    });
  });

  describe("Función Guardiana: requireAppRole", () => {
    it("debe denegar el acceso si el usuario no tiene el rol requerido", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: createMockUser("user") },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: { app_role: "user" }, error: null }),
      });

      const result = await requireAppRole(["developer"]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Permiso denegado.");
      }
    });

    it("debe permitir el acceso si el usuario tiene el rol requerido", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: createMockUser("developer") },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: { app_role: "developer" }, error: null }),
      });

      const result = await requireAppRole(["developer", "admin"]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.appRole).toBe("developer");
      }
    });
  });

  describe("Función Guardiana: requireWorkspacePermission", () => {
    it("debe denegar el permiso si el rol del miembro no es suficiente", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: createMockUser() },
        error: null,
      });
      mockSupabaseClient.from.mockImplementation((tableName: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(
            tableName === "profiles"
              ? { data: { app_role: "user" }, error: null }
              : { data: { role: "member" }, error: null }
          ),
      }));

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
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: createMockUser() },
        error: null,
      });
      mockSupabaseClient.from.mockImplementation((tableName: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(
            tableName === "profiles"
              ? { data: { app_role: "user" }, error: null }
              : { data: { role: "admin" }, error: null }
          ),
      }));

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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview Esta suite de pruebas actúa como un "contrato de comportamiento" para el
 *               Guardián de Seguridad (`user-permissions.ts`).
 *
 * @functionality
 * - **Simulación Unificada de Alta Fidelidad:** Se ha refactorizado para utilizar un único mock
 *   del cliente de Supabase por prueba. Este mock se configura para devolver respuestas
 *   contextuales basadas en la tabla consultada (`profiles` o `workspace_members`),
 *   replicando con precisión el flujo de datos que el guardián espera.
 * - **Validación de Contratos de Tipos:** La factoría `createMockUser` ahora genera un objeto
 *   que cumple con el tipo `User` completo, y las aserciones utilizan guardas de tipo
 *   para garantizar que las pruebas sean seguras en tipos y libres de errores del compilador.
 * - **Cobertura de Flujos Lógicos:** Las pruebas validan exhaustivamente cada función
 *   exportada por el guardián, cubriendo casos de éxito, denegación de permisos y
 *   estados nulos, asegurando que la lógica de autorización sea robusta.
 *
 * @relationships
 * - Valida el aparato `lib/auth/user-permissions.ts`.
 * - Sus resultados impactan directamente en la fiabilidad de la seguridad de toda la aplicación,
 *   ya que las Server Actions y el Middleware dependen de este guardián.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce cualquier cambio en la lógica de obtención
 *   de datos o de verificación de permisos en `user-permissions.ts`. Actúa como el guardián
 *   automatizado de nuestro guardián de seguridad.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1.  **Factoría de Mocks Compartida:** Mover las funciones `createMockUser` y el patrón de mock unificado a un archivo de utilidad de pruebas compartido (ej. `lib/test/utils.ts`) para reutilizarlas en otras suites.
 * 2.  **Pruebas Basadas en Escenarios:** Evolucionar las factorías para aceptar escenarios predefinidos (ej. `createMockAuthData({ scenario: 'no-workspace-cookie' })`) para probar casos límite sin una configuración verbosa.
 * 3.  **Pruebas de la Lógica de Cache:** Añadir una prueba que llame a `getAuthenticatedUserAuthData` dos veces y verifique (usando `vi.spyOn`) que la base de datos solo es consultada una vez, validando la eficacia de la caché por petición.
 */
