// Ruta: lib/hooks/useCampaignsManagement.test.ts
/**
 * @file useCampaignsManagement.test.ts
 * @description Suite de pruebas para el hook `useCampaignsManagement`.
 *              Valida la lógica de estado para la gestión de campañas.
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Creation)
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
  campaigns: { deleteCampaignAction: vi.fn() },
}));
vi.mock("react-hot-toast");

const mockInitialCampaigns: Tables<"campaigns">[] = [
  {
    id: "camp-1",
    name: "Campaña Alpha",
    site_id: "site-1",
    slug: "alpha",
    content: {},
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    id: "camp-2",
    name: "Campaña Beta",
    site_id: "site-1",
    slug: "beta",
    content: {},
    created_at: new Date().toISOString(),
    updated_at: null,
  },
];

describe("Hook: useCampaignsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar correctamente con las campañas proporcionadas", () => {
    const { result } = renderHook(() =>
      useCampaignsManagement(mockInitialCampaigns)
    );
    expect(result.current.campaigns).toEqual(mockInitialCampaigns);
  });

  it("debe revertir el estado si la eliminación en el servidor falla", async () => {
    vi.mocked(campaignActions.deleteCampaignAction).mockResolvedValue({
      success: false,
      error: "Permiso denegado.",
    });
    const { result } = renderHook(() =>
      useCampaignsManagement(mockInitialCampaigns)
    );
    const formData = new FormData();
    formData.append("campaignId", "camp-1");

    await act(async () => {
      result.current.handleDelete(formData);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Permiso denegado.");
      expect(result.current.campaigns).toEqual(mockInitialCampaigns);
    });
  });
});
