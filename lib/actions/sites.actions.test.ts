// lib/actions/sites.actions.test.ts
/**
 * @file sites.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Sitios.
 *              Valida el ciclo de vida completo con un mock de Supabase de alta
 *              fidelidad y datos de prueba que respetan el contrato de Zod,
 *              aislando la lógica de la implementación de FormData.
 * @author Validator (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (High-Fidelity & Logic-Isolated Mocking)
 *
 * @see {@link file://./sites.actions.ts} Para el componente bajo prueba.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Factoría de Mocks Compartida**: (Vigente) Mover la creación de mocks (ej. `mockUser`, `mockSupabaseClient`) a un archivo de utilidades de prueba para reutilizarlo en otras suites.
 * 2.  **Pruebas de Errores de Base de Datos**: (Vigente) Añadir pruebas que simulen diferentes códigos de error devueltos por Supabase y verifiquen que la acción los maneja de forma robusta.
 * 3.  **Validación Completa de Auditoría**: (Vigente) Expandir la aserción de `createAuditLog` para verificar que todos los metadatos correctos son pasados.
 */
import { revalidatePath } from "next/cache";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "./_helpers";
import { createSiteAction } from "./sites.actions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("./_helpers");
vi.mock("next/cache");
vi.mock("@/lib/logging", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe("Arnés de Pruebas: lib/actions/sites.actions.ts", () => {
  const MOCK_USER_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const MOCK_WORKSPACE_ID = "123e4567-e89b-12d3-a456-426614174000";
  const MOCK_SITE_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
  const mockUser = { id: MOCK_USER_ID, email: "test@example.com" };

  const mockSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: MOCK_SITE_ID }, error: null });
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  const mockSupabaseClient = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
    vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
  });

  describe("Acción: createSiteAction", () => {
    it("Camino Feliz: debe crear un sitio exitosamente con datos válidos", async () => {
      // Arrange
      const validSiteData = {
        name: "Mi Sitio Válido",
        subdomain: "sitio-valido",
        workspaceId: MOCK_WORKSPACE_ID,
        description: "Una descripción.",
      };
      const fromEntriesSpy = vi
        .spyOn(Object, "fromEntries")
        .mockReturnValue(validSiteData);

      // Act
      const result = await createSiteAction(new FormData());

      // Assert
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("sites");
      expect(mockInsert).toHaveBeenCalledWith({
        name: "Mi Sitio Válido",
        subdomain: "sitio-valido",
        workspace_id: MOCK_WORKSPACE_ID,
        owner_id: MOCK_USER_ID,
        description: "Una descripción.",
        icon: null,
      });
      expect(createAuditLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/sites");

      fromEntriesSpy.mockRestore();
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos", async () => {
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);
      const siteData = {
        name: "Sitio No Autorizado",
        subdomain: "no-auth",
        workspaceId: MOCK_WORKSPACE_ID,
      };
      const fromEntriesSpy = vi
        .spyOn(Object, "fromEntries")
        .mockReturnValue(siteData);

      const result = await createSiteAction(new FormData());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("No tienes permiso");
      }
      expect(mockFrom).not.toHaveBeenCalled();
      fromEntriesSpy.mockRestore();
    });
  });
});
// lib/actions/sites.actions.test.ts
