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

import { useSitesManagement } from "./useSitesManagement";

// --- Simulación (Mocking) de Dependencias ---

const mockRouterRefresh = vi.fn();
vi.mock("@/navigation", () => ({
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
    campaigns: [{ count: 5 }],
    created_at: new Date().toISOString(),
    workspace_id: "ws-1",
    owner_id: "user-1",
    custom_domain: null,
    updated_at: null,
  },
];

describe("Hook: useSitesManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      vi.useFakeTimers();
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        result.current.setSearchQuery("beta");
      });

      // Antes de que pase el tiempo, el filtro no se ha aplicado
      expect(result.current.filteredSites).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(300); // Avanzar el tiempo del debounce
      });

      // Después del debounce, el filtro se aplica
      await waitFor(() => {
        expect(result.current.filteredSites).toHaveLength(1);
        expect(result.current.filteredSites[0].subdomain).toBe("beta-site");
      });
    });
  });

  describe("Flujo de Creación Optimista (handleCreate)", () => {
    it("debe añadir un sitio temporal a la UI inmediatamente", async () => {
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: true,
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        result.current.handleCreate({ subdomain: "gamma-site", icon: "🌟" });
      });

      expect(result.current.filteredSites).toHaveLength(3);
      expect(result.current.filteredSites[0].subdomain).toBe("gamma-site");
      expect(result.current.filteredSites[0].id).toContain("temp-");
      expect(result.current.isCreating).toBe(true);
      expect(toast.loading).toHaveBeenCalledWith("Criando site...");
    });

    it("debe llamar a la Server Action y refrescar en caso de éxito", async () => {
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: true,
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      await act(async () => {
        await result.current.handleCreate({
          subdomain: "gamma-site",
          icon: "🌟",
        });
      });

      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(toast.dismiss).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Site criado com sucesso!");
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
        expect(result.current.isCreating).toBe(false);
      });
    });

    it("debe revertir el estado de la UI y mostrar un error si la Server Action falla", async () => {
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: false,
        error: "Subdominio ya existe.",
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      await act(async () => {
        await result.current.handleCreate({
          subdomain: "gamma-site",
          icon: "🌟",
        });
      });

      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(toast.dismiss).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Subdominio ya existe.");
        // El sitio temporal debe ser eliminado, volviendo al estado inicial
        expect(result.current.filteredSites).toEqual(mockInitialSites);
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("Flujo de Eliminación Optimista (handleDelete)", () => {
    it("debe eliminar un sitio de la UI inmediatamente", () => {
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: true,
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      act(() => {
        result.current.handleDelete(formData);
      });

      expect(result.current.filteredSites).toHaveLength(1);
      expect(result.current.deletingSiteId).toBe("site-1");
    });

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
        expect(result.current.deletingSiteId).toBeNull();
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

/**
 * @fileoverview La suite de pruebas `useSitesManagement.test.ts` blinda la lógica de cliente más compleja de la página "Mis Sitios".
 * @functionality
 * - **Aislamiento Total:** Simula todas las dependencias (`actions`, `router`, `toast`) para probar el hook de forma aislada.
 * - **Validación de Lógica Optimista:** Contiene pruebas dedicadas para los flujos de creación y eliminación, validando que la UI se actualice instantáneamente y que se revierta correctamente en caso de fallo del servidor.
 * - **Pruebas de Lógica de UI:** Valida la funcionalidad de búsqueda en el cliente y el comportamiento de `debounce` para asegurar una experiencia de usuario fluida y de alto rendimiento.
 * @relationships
 * - Valida el hook `lib/hooks/useSitesManagement.ts`.
 * - Sus resultados impactan directamente en la fiabilidad de la página "Mis Sitios" (`app/[locale]/dashboard/sites/`).
 * @expectations
 * - Se espera que esta suite falle ante cualquier regresión en la lógica de estado optimista, de búsqueda o de interacción con el servidor. Actúa como un guardián de la experiencia del usuario para la gestión de sitios.
 */
// Ruta: lib/hooks/useSitesManagement.test.ts
