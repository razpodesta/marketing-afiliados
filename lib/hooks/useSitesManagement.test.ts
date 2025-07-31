// Ruta: lib/hooks/useSitesManagement.test.ts
/**
 * @file useSitesManagement.test.ts
 * @description Suite de pruebas de nivel de producción para el hook `useSitesManagement`.
 *              Cubre la inicialización de estado, la lógica de búsqueda con debounce,
 *              y valida exhaustivamente los flujos de actualización optimista para la
 *              creación y eliminación de sitios.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.0.0 (Optimistic UI & Debounce Test Suite)
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesActions } from "@/lib/actions";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import type { CreateSiteSchema } from "@/lib/validators";
import type { z } from "zod";

import { useSitesManagement } from "./useSitesManagement";

// --- Simulación de Dependencias ---

const mockRouterRefresh = vi.fn();
vi.mock("@/lib/navigation", () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
  }),
}));

vi.mock("@/lib/actions", () => ({
  sites: {
    createSiteAction: vi.fn(),
    deleteSiteAction: vi.fn(),
  },
}));

vi.mock("react-hot-toast");

// --- Datos de Prueba (Test Data) ---

const mockInitialSites: SiteWithCampaignsCount[] = [
  {
    id: "site-1",
    subdomain: "alpha-site",
    icon: "🚀",
    name: "Alpha Site",
    description: "First site",
    campaigns: [{ count: 2 }],
    created_at: new Date().toISOString(),
    workspace_id: "ws-1",
    owner_id: "user-1",
    custom_domain: null,
    updated_at: null,
  },
  {
    id: "site-2",
    subdomain: "beta-site",
    icon: "💡",
    name: "Beta Site",
    description: "Second site",
    campaigns: [{ count: 5 }],
    created_at: new Date().toISOString(),
    workspace_id: "ws-1",
    owner_id: "user-1",
    custom_domain: null,
    updated_at: null,
  },
];

const mockValidFormData: z.output<typeof CreateSiteSchema> = {
  name: "Gamma Site",
  subdomain: "gamma-site",
  icon: "🌟",
  workspaceId: "ws-1",
  description: "A new site for testing",
};

describe("Hook: useSitesManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debe inicializar correctamente con los sitios proporcionados por el servidor", () => {
    const { result } = renderHook(() => useSitesManagement(mockInitialSites));
    expect(result.current.filteredSites).toEqual(mockInitialSites);
  });

  describe("Lógica de Búsqueda y Debounce", () => {
    it("debe filtrar los sitios basándose en la consulta de búsqueda después del debounce", async () => {
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        result.current.setSearchQuery("beta");
      });

      expect(result.current.filteredSites).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.filteredSites).toHaveLength(1);
        expect(result.current.filteredSites[0].subdomain).toBe("beta-site");
      });
    });
  });

  describe("Flujo de Creación Optimista (handleCreate)", () => {
    it("debe añadir un sitio temporal a la UI inmediatamente y con los datos correctos", async () => {
      // CORRECCIÓN: El mock ahora cumple el contrato de `ActionResult`.
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: true,
        data: { id: "new-site-id" },
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        // CORRECCIÓN: Se llama a `handleCreate` con el objeto de datos completo.
        result.current.handleCreate(mockValidFormData);
      });

      expect(result.current.filteredSites).toHaveLength(3);
      expect(result.current.filteredSites[0].subdomain).toBe("gamma-site");
      expect(result.current.filteredSites[0].name).toBe("Gamma Site");
      expect(result.current.filteredSites[0].id).toContain("temp-");
    });

    it("debe llamar a la Server Action y refrescar en caso de éxito", async () => {
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: true,
        data: { id: "new-site-id" },
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      await act(async () => {
        await result.current.handleCreate(mockValidFormData);
      });

      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("¡Sitio creado con éxito!");
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Flujo de Eliminación Optimista (handleDelete)", () => {
    it("debe revertir el estado si la eliminación en el servidor falla", async () => {
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: false,
        error: "No autorizado.",
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      await act(async () => {
        result.current.handleDelete(formData);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("No autorizado.");
        expect(result.current.filteredSites).toEqual(mockInitialSites);
      });
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de `useEffect` de Sincronización:** Añadir pruebas que validen que si la prop `initialSites` cambia (por ejemplo, después de un `router.refresh`), el estado interno del hook se sincroniza correctamente con los nuevos datos del servidor.
 * 2.  **Factoría de Mocks Avanzada:** Crear funciones factoría (`createMockSite()`) para generar datos de prueba consistentes y reducir la duplicación, haciendo las pruebas más legibles.
 * 3.  **Pruebas de Interacción de Múltiples Acciones:** Diseñar pruebas que simulen al usuario realizando acciones rápidas y concurrentes (ej. eliminar un sitio mientras se está creando otro) para verificar la robustez del manejo de estado.
 */
