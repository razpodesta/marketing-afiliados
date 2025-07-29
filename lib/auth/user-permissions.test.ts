// Ruta: lib/auth/user-permissions.test.ts
/**
 * @file user-permissions.test.ts
 * @description Suite de pruebas de integración para el Guardián de Permisos.
 *              Esta es una red de seguridad crítica que valida la lógica de autorización
 *              en múltiples escenarios, incluyendo casos límite y fallos esperados.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.0.0 (Production-Grade Test Suite)
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as DataLayer from "@/lib/data";
import * as SupabaseServer from "@/lib/supabase/server";

import {
  clearCachedAuthData,
  getAuthenticatedUserAuthData,
  requireAppRole,
  requireWorkspacePermission,
} from "./user-permissions";

// --- Simulación (Mocking) de Módulos Dependientes ---

vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data");
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// --- Factoría de Mocks para Datos de Prueba ---

const createMockUser = (role: "user" | "developer" = "user") => ({
  id: `user-uuid-${role}`,
  app_metadata: { app_role: role },
  // ...otros campos de usuario necesarios...
});

const mockDbClient = (user: any, profile: any, workspaceMember: any = null) => {
  const fromMock = vi.fn().mockImplementation((tableName) => {
    if (tableName === "profiles") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profile, error: null }),
      };
    }
    if (tableName === "workspace_members") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: workspaceMember, error: null }),
      };
    }
    return {};
  });

  vi.mocked(SupabaseServer.createClient).mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: fromMock,
  } as any);
};

// --- Suite de Pruebas Principal ---

describe("Guardián de Permisos: user-permissions.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedAuthData(); // Esencial para aislar las pruebas de la caché
  });

  describe("Función: getAuthenticatedUserAuthData", () => {
    it("debe devolver null si no hay usuario autenticado", async () => {
      vi.mocked(SupabaseServer.createClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);
      const result = await getAuthenticatedUserAuthData();
      expect(result).toBeNull();
    });

    it("debe devolver los datos del usuario y rol si está autenticado y tiene perfil", async () => {
      const user = createMockUser("developer");
      mockDbClient(user, { app_role: "developer" });

      const result = await getAuthenticatedUserAuthData();
      expect(result?.user.id).toBe(user.id);
      expect(result?.appRole).toBe("developer");
    });

    it("debe devolver null si un usuario autenticado no tiene perfil (inconsistencia de datos)", async () => {
      const user = createMockUser();
      // Simulamos que la consulta de perfil falla o no devuelve nada
      mockDbClient(user, null);

      const result = await getAuthenticatedUserAuthData();
      expect(result).toBeNull();
    });

    it("debe utilizar la caché en la segunda llamada dentro de la misma petición", async () => {
      const user = createMockUser();
      mockDbClient(user, { app_role: "user" });

      await getAuthenticatedUserAuthData(); // Primera llamada, llena la caché
      await getAuthenticatedUserAuthData(); // Segunda llamada

      // `getUser` solo debería haber sido llamado una vez.
      expect(SupabaseServer.createClient().auth.getUser).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe("Función: requireAppRole", () => {
    it("debe conceder acceso si el usuario tiene el rol requerido", async () => {
      const user = createMockUser("developer");
      mockDbClient(user, { app_role: "developer" });

      const result = await requireAppRole(["developer", "admin"]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appRole).toBe("developer");
      }
    });

    it("debe denegar el acceso si el usuario no tiene el rol requerido", async () => {
      const user = createMockUser("user");
      mockDbClient(user, { app_role: "user" });

      const result = await requireAppRole(["developer"]);
      expect(result.success).toBe(false);
      // CORRECCIÓN: Guarda de tipo para una aserción segura.
      if (!result.success) {
        expect(result.error).toBe("Permiso denegado.");
      }
    });
  });

  describe("Función: requireWorkspacePermission", () => {
    it("debe conceder acceso si el usuario tiene el permiso de workspace requerido", async () => {
      const user = createMockUser();
      // Simulamos un usuario con rol 'owner' en el workspace
      mockDbClient(user, { app_role: "user" }, { role: "owner" });
      // Mock de la capa de datos
      vi.mocked(DataLayer.sites.getSiteById).mockResolvedValue({
        workspace_id: "ws-123",
      } as any);

      const result = await requireWorkspacePermission("site-abc", ["owner"]);
      expect(result.success).toBe(true);
    });

    it("debe denegar acceso si el usuario no es miembro del workspace", async () => {
      const user = createMockUser();
      // Simulamos que no se encuentra membresía en el workspace
      mockDbClient(user, { app_role: "user" }, null);
      vi.mocked(DataLayer.sites.getSiteById).mockResolvedValue({
        workspace_id: "ws-123",
      } as any);

      const result = await requireWorkspacePermission("site-abc", ["member"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No tienes permiso");
      }
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Concurrencia:** Aunque difícil en JS de un solo hilo, se podrían diseñar pruebas que simulen múltiples llamadas asíncronas para asegurar que la caché por petición se comporte correctamente bajo estrés.
 * 2.  **Factoría de Mocks Avanzada:** La función `mockDbClient` puede ser expandida a una "factoría de mocks" más completa que permita configurar fácilmente diferentes escenarios de error de la base de datos (ej. `mockDbClient({ profile: { error: '...' } })`) para probar la resiliencia de los guardianes.
 * 3.  **Pruebas de Integración con Datos Reales (Opcional):** Para un nivel de confianza máximo, se podría configurar un pipeline de CI/CD que ejecute estas pruebas contra una base de datos de prueba temporal de Supabase, poblada con datos de prueba, para validar el comportamiento contra el sistema real.
 */
// Ruta: lib/auth/user-permissions.test.ts
