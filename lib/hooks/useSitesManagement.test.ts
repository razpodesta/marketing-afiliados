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
import { type z } from "zod";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { type CreateSiteSchema } from "@/lib/validators";
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
      vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
        success: true,
        data: { id: "new-site-id" },
      });
      const { result } = renderHook(() => useSitesManagement(mockInitialSites));

      act(() => {
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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `useSitesManagement.ts` es un hook de estado especializado, diseñado
 *               para desacoplar toda la lógica de negocio de la UI de presentación en la
 *               página "Mis Sitios". Su suite de pruebas ha sido refactorizada para una
 *               máxima fiabilidad.
 *
 * @functionality
 * - **Controlador de Estado Centralizado:** Abstrae toda la gestión de estado (lista de
 *   sitios, consulta de búsqueda, estado de modales, estados de carga) lejos de los
 *   componentes de UI.
 * - **Actualización Optimista Robusta:** Implementa un patrón de "actualización optimista"
 *   para crear y eliminar sitios, proporcionando una experiencia de usuario instantánea. La
 *   suite de pruebas ahora valida rigurosamente este flujo, incluyendo la reversión en
 *   caso de fallo.
 * - **Orquestación de Acciones:** Actúa como el intermediario entre la UI y las Server Actions.
 *   La prueba valida que el método `handleCreate` maneje correctamente el objeto de datos
 *   `FormOutput` y que `handleDelete` procese el `FormData`.
 *
 * @relationships
 * - Es el "cerebro" del componente orquestador `SitesClient.tsx`.
 * - Invoca directamente las Server Actions definidas en `lib/actions/sites.actions.ts`.
 *
 * @expectations
 * - Se espera que este hook sea la única fuente de verdad para la lógica de la página de
 *   gestión de sitios. Con esta suite de pruebas corregida, podemos confiar en que la lógica
 *   de estado, la búsqueda con debounce y los flujos de UI optimista son robustos y
 *   funcionan como se espera.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la lógica de estado de la UI.
 *
 * 1.  **Abstracción a un Hook Genérico:** La lógica de "actualización optimista -> llamada al servidor -> reversión en fallo" es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResource(actions)` para ser utilizado en `sites`, `campaigns`, `members`, etc., reduciendo drásticamente el código duplicado.
 * 2.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "El subdominio ya está en uso. Por favor, elige otro.").
 * 3.  **Cancelación de Acciones:** Para la lógica de búsqueda en el servidor (una mejora futura), se podría integrar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo, optimizando el uso de recursos de red y servidor.
 */
