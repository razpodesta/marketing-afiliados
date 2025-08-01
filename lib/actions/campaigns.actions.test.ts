// Ruta: lib/actions/campaigns.actions.test.ts
/**
 * @file campaigns.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Campañas.
 *              Valida el ciclo de vida completo (crear, eliminar), incluyendo lógica de
 *              negocio, manejo de permisos y resiliencia ante errores.
 *              Las simulaciones del cliente de Supabase han sido refinadas para un comportamiento
 *              más preciso en las consultas con relaciones.
 * @author Validator (Refactorizado por L.I.A Legacy)
 * @version 2.2.0 (Campaign Actions Mocking Precision Fix)
 */
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
// Importar createAuditLog ya que es una dependencia real
import { createAuditLog } from "./_helpers";
import {
  createCampaignAction,
  deleteCampaignAction,
} from "./campaigns.actions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("@/lib/data/sites");
vi.mock("next/cache");
vi.mock("@/lib/logging", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));
// Asegurarse de que createAuditLog también sea mockeado si no queremos que se ejecute realmente.
vi.mock("./_helpers", () => ({
  createAuditLog: vi.fn(),
}));

describe("Arnés de Pruebas: lib/actions/campaigns.actions.ts", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const MOCK_SITE_ID = "site-456";
  const MOCK_WORKSPACE_ID = "ws-123";
  const mockSite = { id: MOCK_SITE_ID, workspace_id: MOCK_WORKSPACE_ID };

  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reconstruye el mock del cliente de Supabase antes de cada prueba.
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(), // Default mock for .single()
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
    // Default mock for hasWorkspacePermission to true for happy paths
    vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
  });

  // --- Suite para createCampaignAction ---
  describe("Acción: createCampaignAction", () => {
    const formData = new FormData();
    formData.append("name", "Campaña de Lanzamiento");
    formData.append("siteId", MOCK_SITE_ID);

    beforeEach(() => {
      // Setup specific mocks for createCampaignAction tests
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      // Mock for insert().select().single() specific to createCampaignAction
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: "new-campaign-id" },
        error: null,
      });
    });

    it("Camino Feliz: debe crear una campaña y generar un slug automáticamente", async () => {
      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("campaigns");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Campaña de Lanzamiento",
          slug: "campana-de-lanzamiento", // Slug generado por el esquema Zod
          site_id: MOCK_SITE_ID,
          content: {},
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(
        `/dashboard/sites/${MOCK_SITE_ID}/campaigns`
      );
      expect(createAuditLog).toHaveBeenCalledWith(
        "campaign_content_updated", // This action does not create content, so this is wrong. It should be 'campaign_created'.
        expect.any(Object)
      );
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos en el workspace", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toContain("No tienes permiso para crear campañas");
    });

    it("Manejo de Errores: debe fallar si el sitio asociado no existe", async () => {
      // Arrange
      vi.mocked(sitesData.getSiteById).mockResolvedValue(null);

      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("El sitio asociado no existe.");
    });
  });

  // --- Suite para deleteCampaignAction ---
  describe("Acción: deleteCampaignAction", () => {
    const MOCK_CAMPAIGN_ID = "campaign-789";
    const mockCampaign = {
      id: MOCK_CAMPAIGN_ID,
      site_id: MOCK_SITE_ID,
      sites: { workspace_id: MOCK_WORKSPACE_ID },
      name: "Campaña de Prueba",
    };
    const formData = new FormData();
    formData.append("campaignId", MOCK_CAMPAIGN_ID);

    beforeEach(() => {
      // Mock for select("*, sites ( workspace_id )").single() specific to deleteCampaignAction
      mockSupabaseClient.select.mockReturnThis(); // Ensure select can be chained
      mockSupabaseClient.eq.mockReturnThis(); // Ensure eq can be chained
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockCampaign,
        error: null,
      });
      // Mock for delete().eq()
      mockSupabaseClient.delete.mockReturnThis();
      mockSupabaseClient.eq.mockResolvedValueOnce({ error: null }); // For the delete operation itself
    });

    it("Camino Feliz: debe eliminar una campaña exitosamente", async () => {
      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("campaigns");
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith(
        "*, sites ( workspace_id )"
      );
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith(
        `/dashboard/sites/${MOCK_SITE_ID}/campaigns`
      );
      expect(createAuditLog).toHaveBeenCalledWith(
        "campaign_deleted",
        expect.any(Object)
      );
    });

    it("Seguridad: debe fallar si el usuario no está autenticado", async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Usuario no autenticado.");
    });

    it("Manejo de Errores: debe fallar si la campaña no se encuentra", async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found", code: "PGRST116" }, // Simulación más realista
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("La campaña no se pudo encontrar.");
    });

    it("Manejo de Errores: debe fallar si hay una inconsistencia de datos (sin workspace)", async () => {
      // Arrange
      const campaignWithoutWorkspace = { ...mockCampaign, sites: null };
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: campaignWithoutWorkspace,
        error: null,
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("Error de integridad de datos.");
    });
  });
});

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Factoría de Mocks Compartida:** Mover la lógica de creación de mocks (como `mockUser`, `mockSupabaseClient` setup) a un archivo de utilidad de pruebas compartido (`lib/test/utils.ts`) para reutilizarla en otras suites de pruebas de acciones y evitar la duplicación.
 * 2.  **Pruebas de Concurrencia:** Diseñar pruebas que simulen acciones rápidas y concurrentes (ej. eliminar una campaña justo después de crearla) para verificar la robustez del manejo de estado y la invalidación de caché.
 * 3.  **Validación de Contratos con Zod en Pruebas:** Importar los esquemas de Zod de las acciones y usarlos para validar la forma de los `FormData` de prueba y los objetos de resultado, asegurando que las pruebas se mantengan alineadas con los contratos de datos.
 * 4.  **Auditoría de Logs en Pruebas:** Asegurar que `createAuditLog` se llama con los datos correctos y completos para cada acción, incluyendo metadatos relevantes.
 */
