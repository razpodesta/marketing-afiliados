// lib/hooks/useCampaignsManagement.test.ts
/**
 * @file useCampaignsManagement.test.ts
 * @description Suite de pruebas para el hook `useCampaignsManagement`.
 *              Valida la lógica de estado para la gestión de campañas,
 *              incluyendo las actualizaciones optimistas para creación y eliminación.
 *              La prueba de rollback ha sido corregida para validar correctamente
 *              el estado intermedio optimista antes de la reversión.
 * @author L.I.A Legacy
 * @version 2.1.0 (Correct Optimistic State Validation)
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { campaigns as campaignActions } from "@/lib/actions";
import { type Tables } from "@/lib/types/database";
import { useCampaignsManagement } from "./useCampaignsManagement";

// --- Simulación de Dependencias ---
const mockRouterRefresh = vi.fn();
vi.mock("@/lib/navigation", () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));
vi.mock("@/lib/actions", () => ({
  campaigns: {
    createCampaignAction: vi.fn(),
    deleteCampaignAction: vi.fn(),
  },
}));
vi.mock("react-hot-toast");

const MOCK_SITE_ID = "site-xyz-789";
const mockInitialCampaigns: Tables<"campaigns">[] = [
  {
    id: "camp-1",
    name: "Campaña Alpha",
    site_id: MOCK_SITE_ID,
    slug: "alpha",
    content: {},
    created_at: new Date().toISOString(),
    updated_at: null,
  },
];

describe("Hook: useCampaignsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe añadir una campaña optimista y luego refrescar en caso de éxito", async () => {
    // Arrange
    vi.mocked(campaignActions.createCampaignAction).mockResolvedValue({
      success: true,
      data: { id: "new-real-id" },
    });
    const { result } = renderHook(() =>
      useCampaignsManagement(mockInitialCampaigns, MOCK_SITE_ID)
    );
    const formData = new FormData();
    formData.append("name", "Campaña Nueva");
    formData.append("siteId", MOCK_SITE_ID);

    // Act
    act(() => {
      result.current.handleCreate(formData);
    });

    // Assert (Optimistic State)
    expect(result.current.campaigns).toHaveLength(2);
    expect(result.current.campaigns[1].name).toBe("Campaña Nueva");
    expect(result.current.campaigns[1].id).toMatch(/^optimistic-/);

    // Assert (Final State)
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Campaña creada con éxito.");
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("debe añadir una campaña optimista y luego revertir el estado en caso de fallo", async () => {
    // Arrange
    vi.mocked(campaignActions.createCampaignAction).mockResolvedValue({
      success: false,
      error: "Límite de campañas alcanzado.",
    });
    const { result } = renderHook(() =>
      useCampaignsManagement(mockInitialCampaigns, MOCK_SITE_ID)
    );
    const formData = new FormData();
    formData.append("name", "Campaña Fallida");
    formData.append("siteId", MOCK_SITE_ID);

    // Act (Síncrono)
    act(() => {
      result.current.handleCreate(formData);
    });

    // Assert (Optimistic State - Inmediato)
    expect(result.current.campaigns).toHaveLength(2);

    // Assert (Final State after async rollback)
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Límite de campañas alcanzado.");
      expect(result.current.campaigns).toEqual(mockInitialCampaigns);
    });
  });

  it("debe revertir el estado si la eliminación en el servidor falla", async () => {
    // Arrange
    vi.mocked(campaignActions.deleteCampaignAction).mockResolvedValue({
      success: false,
      error: "Permiso denegado.",
    });
    const { result } = renderHook(() =>
      useCampaignsManagement(mockInitialCampaigns, MOCK_SITE_ID)
    );
    const formData = new FormData();
    formData.append("campaignId", "camp-1");

    // Act
    act(() => {
      result.current.handleDelete(formData);
    });

    // Assert (Optimistic State)
    expect(result.current.campaigns).toHaveLength(0);

    // Assert (Final State after rollback)
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Permiso denegado.");
      expect(result.current.campaigns).toEqual(mockInitialCampaigns);
    });
  });
});
// lib/hooks/useCampaignsManagement.test.ts
