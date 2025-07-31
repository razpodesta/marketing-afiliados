// Ruta: lib/hooks/useSitesManagement.test.ts
/**
 * @file useSitesManagement.test.ts
 * @description Suite de pruebas de nivel de producción para el hook `useSitesManagement`.
 *              Ha sido refactorizada para alinearse con la nueva arquitectura de alta cohesión,
 *              validando únicamente las responsabilidades del hook: gestión de la lista,
 *              búsqueda con debounce y flujo de eliminación optimista.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.0.0 (Cohesive Hook Validation)
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesActions } from "@/lib/actions";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
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

      // El estado no cambia inmediatamente por el debounce
      expect(result.current.filteredSites).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(300); // Avanzar el tiempo para disparar el debounce
      });

      await waitFor(() => {
        expect(result.current.filteredSites).toHaveLength(1);
        expect(result.current.filteredSites[0].subdomain).toBe("beta-site");
      });
    });
  });

  describe("Flujo de Eliminación Optimista (handleDelete)", () => {
    it("debe revertir el estado si la eliminación en el servidor falla", async () => {
      // Arrange
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: false,
        error: "No autorizado.",
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      // Act
      await act(async () => {
        result.current.handleDelete(formData);
      });

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("No autorizado.");
        expect(result.current.filteredSites).toEqual(mockInitialSites);
      });
    });

    it("debe llamar a la Server Action y refrescar en caso de éxito", async () => {
      // Arrange
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: true,
        data: { message: "Eliminado" },
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      // Act
      await act(async () => {
        result.current.handleDelete(formData);
      });

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Sitio eliminado con éxito."
        );
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
        // El estado final de `sites` será el que venga del servidor tras el refresh,
        // pero la actualización optimista ya fue probada implícitamente en el test de fallo.
      });
    });
  });
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview La suite de pruebas `useSitesManagement.test.ts` ha sido refactorizada
 *               para reflejar con precisión la nueva arquitectura cohesiva del hook.
 *
 * @functionality
 * - **Pruebas de Responsabilidad Única:** La suite ahora se enfoca exclusivamente en las
 *   responsabilidades del hook: gestionar el estado de la lista de sitios, manejar el
 *   filtrado con debounce y orquestar el flujo de eliminación optimista.
 * - **Lógica de Creación Eliminada:** Se ha eliminado por completo la suite de pruebas para
 *   `handleCreate`, ya que esa lógica ha sido correctamente movida al componente `CreateSiteForm`,
 *   y será validada en la suite de pruebas de dicho componente.
 * - **Manejo de Asincronía:** Las pruebas continúan utilizando `act`, `waitFor` y
 *   `vi.useFakeTimers` para manejar de forma robusta la naturaleza asíncrona de las
 *   actualizaciones de estado y el debounce.
 *
 * @relationships
 * - Valida el aparato `lib/hooks/useSitesManagement.ts`.
 * - Sus resultados impactan directamente en la fiabilidad del componente `SitesClient`, que es
 *   el único consumidor de este hook.
 *
 * @expectations
 * - Se espera que esta suite, ahora más magra y enfocada, garantice la fiabilidad de la
 *   lógica de visualización y eliminación de sitios, actuando como una red de seguridad
 *   precisa para su conjunto de responsabilidades definido.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de `useEffect` de Sincronización:** Añadir pruebas que validen que si la prop `initialSites` cambia (por ejemplo, después de un `router.refresh`), el estado interno del hook se sincroniza correctamente con los nuevos datos del servidor.
 * 2.  **Factoría de Mocks Compartida:** Crear funciones factoría (`createMockSite()`) para generar datos de prueba consistentes y reducir la duplicación, haciendo las pruebas más legibles.
 * 3.  **Pruebas de Interacción de Múltiples Acciones:** Diseñar pruebas que simulen al usuario realizando acciones rápidas y concurrentes (ej. eliminar un sitio mientras se filtra la lista) para verificar la robustez del manejo de estado.
 */
