// lib/auth/user-permissions.test.ts
/**
 * @file user-permissions.test.ts
 * @description Suite de pruebas de integración de alta fidelidad para el Guardián
 *              de Seguridad (`user-permissions.ts`). Esta suite ha sido refactorizada
 *              para una total seguridad de tipos y una simulación de datos robusta.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.1.0 (Fix: Definitive Module-Level Mocking Strategy)
 * @see {@link file://./user-permissions.ts} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA
 * 1.  **Mocking a Nivel de Módulo:** La simulación de `next/headers` se realiza ahora
 *     a nivel superior usando `vi.mock`. Esto intercepta el módulo antes de que
 *     cualquier código lo importe, resolviendo el error `TypeError` en su raíz. La
 *     configuración del valor de la cookie se realiza dentro de cada prueba para
 *     mantener el control contextual.
 * 2.  **Mocks de Alta Fidelidad y Contextuales:** El mock del cliente de Supabase se
 *     configura *dentro de cada prueba* para devolver respuestas específicas
 *     basadas en la tabla consultada (`profiles` vs. `workspace_members`).
 * 3.  **Factorías de Datos:** Se utilizan funciones `createMockUser` para generar
 *     objetos de datos consistentes y tipados.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas del Guardián de Seguridad.
 *
 * 1.  **Pruebas Basadas en Escenarios:** (Vigente) Evolucionar las factorías para aceptar escenarios predefinidos (ej. `createMockUser({ scenario: 'unconfirmed' })`) para probar fácilmente más casos límite.
 * 2.  **Pruebas de la Lógica de Cache:** (Vigente) Añadir una prueba que llame a `getAuthenticatedUserAuthData` dos veces y verifique (usando `vi.spyOn`) que la base de datos solo es consultada una vez.
 *
 * @section MEJORAS ADICIONADAS
 * 1.  **Factoría de Mocks Compartida:** Mover las funciones `createMockUser` y el patrón de mock unificado a un archivo de utilidad de pruebas compartido (ej. `lib/test/utils.ts`) para reutilizarlas en otras suites, adhiriéndose al principio DRY.
 */
import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import {
  clearCachedAuthData,
  getAuthenticatedUserAuthData,
  requireAppRole,
} from "./user-permissions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
// CORRECCIÓN CRÍTICA: Se simula el módulo `next/headers` a nivel superior.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// --- Factorías de Mocks de Alta Fidelidad ---
const createMockUser = (
  role: "user" | "developer" | "admin" = "user"
): User => ({
  id: `user-uuid-${role}`,
  app_metadata: { provider: "email", providers: ["email"], app_role: role },
  user_metadata: { full_name: `Test ${role}` },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: `${role}@test.com`,
  confirmation_sent_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
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

    mockSupabaseClient = {
      from: vi.fn(),
      auth: { getUser: vi.fn() },
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
      // Arrange
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

      // CORRECCIÓN: Se configura el mock de `cookies` dentro de la prueba.
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: "ws-123" }),
      } as any);

      // Act
      const result = await getAuthenticatedUserAuthData();

      // Assert
      expect(result?.user.id).toBe(user.id);
      expect(result?.appRole).toBe("developer");
      expect(result?.activeWorkspaceRole).toBe("owner");
    });
  });

  describe("Función Guardiana: requireAppRole", () => {
    it("debe denegar el acceso si el usuario no tiene el rol requerido", async () => {
      // Arrange
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

      // Act
      const result = await requireAppRole(["developer"]);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Permiso denegado.");
      }
    });
  });
});
// lib/auth/user-permissions.test.ts
