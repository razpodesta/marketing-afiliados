// lib/actions/campaigns.actions.test.ts
/**
 * @file campaigns.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Campañas.
 *              Valida el ciclo de vida completo con mocks de alta fidelidad y contextualmente conscientes.
 * @author L.I.A Legacy & RaZ Podestá (Validator)
 * @co-author MetaShark
 * @version 3.7.0 (Fix: Definitive Context-Aware Mocking & Logic Alignment)
 * @see {@link file://./campaigns.actions.ts} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA
 * 1.  **Aislamiento de Lógica:** Se utiliza `vi.spyOn(Object, 'fromEntries')` para
 *     alimentar directamente a la acción con un objeto plano.
 * 2.  **Mocks de Alta Fidelidad y Aislados por Prueba:** El cliente de Supabase se simula con
 *     referencias de función estables, pero los valores que resuelven las promesas
 *     (ej. `mockSingle.mockResolvedValue`) se configuran *dentro de cada test*.
 * 3.  **Aserción Lógica Corregida:** La aserción para la creación del slug ahora refleja
 *     fielmente la lógica de transliteración del validador de producción.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Factoría de Mocks Compartida**: (Vigente) Mover la creación de mocks a un archivo de utilidades de prueba.
 * 2.  **Pruebas de Errores de Base de Datos**: (Vigente) Añadir pruebas que simulen diferentes códigos de error de Supabase.
 * 3.  **Validación Completa de Auditoría**: (Vigente) Expandir la aserción de `createAuditLog` para verificar todos los metadatos.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "./_helpers";
import {
  createCampaignAction,
  deleteCampaignAction,
} from "./campaigns.actions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("@/lib/data/sites");
vi.mock("@/lib/logging", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("./_helpers");
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("Arnés de Pruebas: lib/actions/campaigns.actions.ts", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const MOCK_SITE_ID = "00000000-0000-0000-0000-000000000456";
  const MOCK_WORKSPACE_ID = "ws-123";
  const MOCK_CAMPAIGN_ID = "00000000-0000-0000-0000-000000000789";
  const mockSite = { id: MOCK_SITE_ID, workspace_id: MOCK_WORKSPACE_ID };

  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockDelete = vi.fn();
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    select: mockSelect,
    delete: mockDelete,
  }));
  const mockSupabaseClient = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
    vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
  });

  describe("Acción: createCampaignAction", () => {
    it("Camino Feliz: debe crear una campaña y generar un slug correctamente transliterado", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: { id: "new-campaign-id" },
        error: null,
      });
      const validCampaignData = {
        name: "Campaña de Ñandú",
        siteId: MOCK_SITE_ID,
      };
      const fromEntriesSpy = vi
        .spyOn(Object, "fromEntries")
        .mockReturnValue(validCampaignData);

      // Act
      const result = await createCampaignAction(new FormData());

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            slug: "campana-de-nandu",
          })
        );
      }
      fromEntriesSpy.mockRestore();
    });
  });

  describe("Acción: deleteCampaignAction", () => {
    it("Camino Feliz: debe eliminar una campaña existente", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: {
          id: MOCK_CAMPAIGN_ID,
          site_id: MOCK_SITE_ID,
          sites: { workspace_id: MOCK_WORKSPACE_ID },
        },
        error: null,
      });
      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      const formData = new FormData();
      formData.set("campaignId", MOCK_CAMPAIGN_ID);

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(mockDelete().eq).toHaveBeenCalledWith("id", MOCK_CAMPAIGN_ID);
      }
    });
  });
});
// lib/actions/campaigns.actions.test.ts
