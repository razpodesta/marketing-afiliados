// Ruta: lib/actions/sites.actions.test.ts
/**
 * @file sites.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Sitios.
 *              Valida el ciclo de vida completo (crear, actualizar, eliminar), incluyendo
 *              lógica de negocio, manejo de permisos y resiliencia ante errores.
 * @author Validator
 * @version 2.0.0 (Consolidated Test Harness)
 */
import { revalidatePath } from "next/cache";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "./_helpers";
import {
  createSiteAction,
  updateSiteAction,
  deleteSiteAction,
} from "./sites.actions";

// --- Simulación de Dependencias (Mocks) ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("@/lib/data/sites");
vi.mock("./_helpers");
vi.mock("next/cache");

describe("Arnés de Pruebas: lib/actions/sites.actions.ts", () => {
  const mockUser = { id: "user-valid", email: "test@example.com" };

  // --- Suite para createSiteAction ---
  describe("Acción: createSiteAction", () => {
    let mockSupabaseClient: any;
    const formData = new FormData();
    formData.append("name", "Mi Sitio Válido");
    formData.append("subdomain", "sitio-valido");
    formData.append("icon", "🚀");
    formData.append("workspaceId", "ws-valid");

    beforeEach(() => {
      vi.clearAllMocks();
      mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: () => ({
          insert: () => ({ select: () => ({ single: vi.fn() }) }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
      vi.mocked(sitesData.getSiteDataByHost).mockResolvedValue(null);
    });

    it("Camino Feliz: debe crear un sitio exitosamente con datos válidos", async () => {
      // Arrange
      mockSupabaseClient
        .from()
        .insert()
        .select()
        .single.mockResolvedValue({ data: { id: "new-site-id" }, error: null });

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/sites");
    });

    it("Seguridad: debe fallar si el usuario no está autenticado", async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Usuario no autenticado.");
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("No tienes permiso");
    });
  });

  // --- Suite para updateSiteAction ---
  describe("Acción: updateSiteAction", () => {
    const mockSite = { id: "site-to-update", workspace_id: "ws-valid" };
    const formData = new FormData();
    formData.append("siteId", "site-to-update");
    formData.append("name", "Nombre Actualizado");

    beforeEach(() => {
      vi.clearAllMocks();
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: () => ({
          update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe actualizar un sitio exitosamente", async () => {
      // Act
      const result = await updateSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalledWith(
        "site.updated",
        expect.any(Object)
      );
    });

    it("Manejo de Errores: debe fallar si el siteId no existe", async () => {
      // Arrange
      vi.mocked(sitesData.getSiteById).mockResolvedValue(null);

      // Act
      const result = await updateSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("El sitio no fue encontrado.");
    });
  });

  // --- Suite para deleteSiteAction ---
  describe("Acción: deleteSiteAction", () => {
    const mockSite = {
      id: "site-to-delete",
      workspace_id: "ws-valid",
      subdomain: "a-borrar",
    };
    const formData = new FormData();
    formData.append("siteId", "site-to-delete");

    beforeEach(() => {
      vi.clearAllMocks();
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: () => ({
          delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe eliminar un sitio exitosamente", async () => {
      // Act
      const result = await deleteSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalledWith(
        "site.deleted",
        expect.any(Object)
      );
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos para eliminar", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await deleteSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toContain(
          "No tienes permiso para eliminar este sitio."
        );
    });
  });
});
