// Ruta: lib/hooks/useSitesManagement.test.ts
/**
 * @file useSitesManagement.test.ts
 * @description Suite de pruebas de nivel de producción para el hook `useSitesManagement`.
 *              Ha sido refactorizada para alinearse con la nueva arquitectura de alta cohesión,
 *              validando únicamente las responsabilidades del hook: gestión de la lista,
 *              búsqueda con debounce y flujo de eliminación optimista.
 *              Las interacciones asíncronas y los mocks de Server Actions han sido refinados.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.1.0 (Hook Async Interaction Fix)
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesActions } from "@/lib/actions";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import { useRouter } from "@/lib/navigation";
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
    icon: "🚀", // Mantener icono para SiteWithCampaignsCount mock, aunque ya no se use en el form
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
    vi.useFakeTimers(); // Habilitar temporizadores simulados
  });

  afterEach(() => {
    vi.useRealTimers(); // Restaurar temporizadores reales
  });

  it("debe inicializar correctamente con los sitios proporcionados por el servidor", () => {
    const { result } = renderHook(() => useSitesManagement(mockInitialSites));
    expect(result.current.filteredSites).toEqual(mockInitialSites);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.isCreateDialogOpen).toBe(false);
  });

  describe("Lógica de Búsqueda y Debounce", () => {
    it("debe filtrar los sitios basándose en la consulta de búsqueda después del debounce", async () => {
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      // Act: Simular la escritura del usuario
      act(() => {
        result.current.setSearchQuery("beta");
      });

      // Assert: El estado no debería cambiar inmediatamente (debounce)
      expect(result.current.filteredSites).toHaveLength(2); // Todavía tiene todos los sitios

      // Act: Avanzar el tiempo para que el debounce se dispare
      act(() => {
        vi.advanceTimersByTime(300); // Mover el tiempo 300ms (tiempo de debounce configurado en el hook)
      });

      // Assert: Esperar a que el estado se actualice
      await waitFor(() => {
        expect(result.current.searchQuery).toBe("beta"); // Verifica que la query se actualizó
        expect(result.current.filteredSites).toHaveLength(1);
        expect(result.current.filteredSites[0].subdomain).toBe("beta-site");
      });
    });

    it("no debe filtrar hasta que el debounce termine", async () => {
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        result.current.setSearchQuery("al");
      });
      act(() => {
        vi.advanceTimersByTime(100); // No suficiente para el debounce
      });
      expect(result.current.filteredSites).toHaveLength(2);

      act(() => {
        result.current.setSearchQuery("alpha");
      });
      act(() => {
        vi.advanceTimersByTime(299); // No suficiente para el debounce completo
      });
      expect(result.current.filteredSites).toHaveLength(2); // Todavía no se ha filtrado

      act(() => {
        vi.advanceTimersByTime(1); // Un milisegundo más para disparar
      });
      await waitFor(() => {
        expect(result.current.filteredSites).toHaveLength(1);
        expect(result.current.filteredSites[0].subdomain).toBe("alpha-site");
      });
    });

    it("debe limpiar la búsqueda correctamente", async () => {
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
        result.current.setSearchQuery("alpha");
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() => expect(result.current.filteredSites).toHaveLength(1));

      act(() => {
        result.current.setSearchQuery(""); // Limpiar búsqueda
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(result.current.filteredSites).toHaveLength(2); // Todos los sitios de nuevo
        expect(result.current.searchQuery).toBe("");
      });
    });
  });

  describe("Flujo de Eliminación Optimista (handleDelete)", () => {
    it("debe remover el sitio de la UI inmediatamente y revertir el estado si la eliminación en el servidor falla", async () => {
      // Arrange
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: false,
        error: "No autorizado.",
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      // Act: Disparar la eliminación
      await act(async () => {
        // La actualización optimista ocurre de inmediato
        result.current.handleDelete(formData);
        // Esperar a que la promesa se resuelva (la Server Action mockeada)
        await vi.runAllTimers(); // No hay timers internos en handleDelete, pero asegura que cualquier Promise.resolve se procese.
      });

      // Assert:
      // 1. Verificar que el sitio se eliminó optimísticamente
      expect(result.current.filteredSites).toHaveLength(1);
      expect(result.current.filteredSites).not.toContainEqual(
        expect.objectContaining({ id: "site-1" })
      );
      expect(result.current.deletingSiteId).toBe("site-1");
      expect(result.current.isPending).toBe(false); // isPending debería ser false después de la resolución

      // 2. Verificar que se mostró el toast de error y el estado se revirtió
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("No autorizado.");
        expect(result.current.filteredSites).toEqual(mockInitialSites); // Estado revertido
        expect(result.current.deletingSiteId).toBeNull();
      });
    });

    it("debe remover el sitio de la UI, llamar a la Server Action y refrescar en caso de éxito", async () => {
      // Arrange
      vi.mocked(sitesActions.deleteSiteAction).mockResolvedValue({
        success: true,
        data: { message: "Eliminado" }, // Mock de respuesta exitosa
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));
      const formData = new FormData();
      formData.append("siteId", "site-1");

      // Act: Disparar la eliminación
      await act(async () => {
        result.current.handleDelete(formData);
        await vi.runAllTimers(); // Asegura que las promesas internas se procesen
      });

      // Assert:
      // 1. Verificar la actualización optimista inicial
      expect(result.current.filteredSites).toHaveLength(1);
      expect(result.current.filteredSites).not.toContainEqual(
        expect.objectContaining({ id: "site-1" })
      );
      expect(result.current.deletingSiteId).toBe("site-1");

      // 2. Verificar que se mostró el toast de éxito y se llamó a router.refresh()
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Sitio eliminado con éxito."
        );
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
        // El estado final de `filteredSites` no importa aquí porque `router.refresh()`
        // hará que el componente se re-renderice con datos frescos del servidor.
        expect(result.current.deletingSiteId).toBeNull();
      });
    });
  });
});

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Abstracción a un Hook Genérico (`useOptimisticResource`):** La lógica de "actualización optimista -> llamada al servidor -> reversión en fallo" es un patrón reutilizable (`handleDelete` y `handleCreateSuccess` si fuera optimista). Se podría crear un hook genérico `useOptimisticResource(actions)` que acepte las Server Actions de crear/eliminar como parámetros para ser reutilizado en `sites`, `campaigns`, `members`, etc., reduciendo drásticamente el código duplicado y mejorando la consistencia.
 * 2.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "No se puede eliminar un sitio con campañas activas"). Esto implicaría refinar el tipo `ActionResult` para incluir códigos de error.
 * 3.  **Cancelación de Peticiones de Búsqueda:** Para una UX muy refinada, si el usuario escribe rápidamente, las peticiones `checkSubdomainAvailabilityAction` (dentro de `SubdomainInput`) podrían cancelarse si una nueva petición es iniciada antes de que la anterior termine. Esto se lograría con `AbortController` o un patrón de `stale-while-revalidate` para las peticiones debounce.
 * 4.  **Estado de `isCreating` para el `SitesHeader`:** Aunque la lógica de creación se movió a `CreateSiteForm`, `SitesHeader` no tiene una forma directa de mostrar un estado global de "creando sitio" si se desea. El hook podría exportar un estado `isCreating` que se active al llamar a `setCreateDialogOpen(true)` o al iniciar el `processSubmit` en el formulario.
 */
