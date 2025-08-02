// lib/auth/user-permissions.test.ts
/**
 * @file user-permissions.test.ts
 * @description Suite de pruebas de integración de alta fidelidad para el Guardián
 *              de Seguridad (`user-permissions.ts`). Esta suite ha sido refactorizada
 *              para una total seguridad de tipos y una simulación de datos robusta,
 *              resolviendo fallos de contexto y garantizando la fiabilidad de la capa de autorización.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.1.0 (Fix: Definitive Module-Level Mocking Strategy)
 * @see {@link file://./user-permissions.ts} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA ("Operación Reloj Suizo")
 * 1.  **Mocking a Nivel de Módulo:** La simulación de `next/headers` se realiza ahora
 *     a nivel superior usando `vi.mock`. Esto intercepta el módulo antes de que
 *     cualquier código lo importe, resolviendo errores de ejecución en su raíz.
 * 2.  **Mocks de Alta Fidelidad y Contextuales:** El mock del cliente de Supabase se
 *     configura *dentro de cada prueba* para devolver respuestas específicas
 *     basadas en la tabla consultada (`profiles` vs. `workspace_members`),
 *     simulando el comportamiento real de la base de datos.
 * 3.  **Factorías de Datos:** Se utilizan funciones `createMockUser` para generar
 *     objetos de datos consistentes y tipados, eliminando la duplicación de código
 *     y aumentando la legibilidad de las pruebas.
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
const createMockUser = (role: "user" | "developer" | "admin" = "user"): User =>
  ({
    id: `user-uuid-${role}`,
    app_metadata: { provider: "email", providers: ["email"] }, // app_role viene de la tabla profiles
    user_metadata: { full_name: `Test ${role}` },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: `${role}@test.com`,
    email_confirmed_at: new Date().toISOString(),
    // ...otros campos requeridos por el tipo User
  }) as User;

describe("Guardián de Seguridad: user-permissions.ts", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedAuthData(); // Limpia la caché en memoria antes de cada prueba

    mockSupabaseClient = {
      from: vi.fn(),
      auth: { getUser: vi.fn() },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  describe("Función: getAuthenticatedUserAuthData", () => {
    it("debe devolver null si no hay usuario en la sesión", async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await getAuthenticatedUserAuthData();

      // Assert
      expect(result).toBeNull();
    });

    it("debe devolver los datos completos para un usuario 'developer'", async () => {
      // Arrange
      const user = createMockUser("developer");
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });

      // Simulación contextual de las consultas a la DB
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
      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: "ws-123" }),
      } as any);

      // Act
      const result = await getAuthenticatedUserAuthData();

      // Assert
      expect(result?.user.id).toBe(user.id);
      expect(result?.appRole).toBe("developer");
      expect(result?.activeWorkspaceRole).toBe("owner");
      expect(result?.activeWorkspaceId).toBe("ws-123");
    });
  });

  describe("Función Guardiana: requireAppRole", () => {
    it("debe denegar el acceso si el usuario no tiene el rol requerido", async () => {
      // Arrange
      const user = createMockUser("user");
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });
      // CORRECCIÓN: Se asegura que el mock de 'profiles' devuelva el rol 'user'
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: { app_role: "user" }, error: null }),
      });
      vi.mocked(cookies).mockReturnValue({ get: vi.fn() } as any);

      // Act
      const result = await requireAppRole(["developer"]);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PERMISSION_DENIED");
      }
    });

    it("debe permitir el acceso a un 'developer' cuando se requiere el rol 'developer'", async () => {
      // Arrange
      const user = createMockUser("developer");
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: { app_role: "developer" }, error: null }),
      });
      vi.mocked(cookies).mockReturnValue({ get: vi.fn() } as any);

      // Act
      const result = await requireAppRole(["developer"]);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appRole).toBe("developer");
      }
    });
  });
});
// lib/auth/user-permissions.test.ts
