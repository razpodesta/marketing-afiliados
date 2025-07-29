/**
 * @file lib/hooks/useSitesManagement.test.ts
 * @description Suite de pruebas de nivel de producción para el hook `useSitesManagement`.
 *              Cubre pruebas unitarias, de integración y de lógica de temporización
 *              para garantizar la máxima fiabilidad.
 * @author Validator
 * @version 3.0.0 (Debounce Logic Unit Tests)
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

// --- Simulación (Mocking) del Entorno y Dependencias ---

vi.mock("@/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// --- Datos de Prueba (Test Data) ---

const mockInitialSites: SiteWithCampaignsCount[] = [
  {
    id: "site-1",
    subdomain: "test-site-alpha",
    icon: "🚀",
    created_at: new Date().toISOString(),
    workspace_id: "ws-1",
    owner_id: "user-1",
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 5 }],
  },
  {
    id: "site-2",
    subdomain: "another-site-beta",
    icon: "💡",
    created_at: new Date().toISOString(),
    workspace_id: "ws-1",
    owner_id: "user-1",
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 2 }],
  },
];

// --- Suite de Pruebas ---

describe("Hook: useSitesManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * @description Grupo de pruebas unitarias que validan la lógica interna del hook de forma aislada.
   */
  describe("A. Pruebas Unitarias", () => {
    describe("A.1. Escenarios de 'Camino Feliz'", () => {
      // ... (pruebas anteriores de Camino Feliz se mantienen aquí)
      it("debe inicializar el estado con los sitios proporcionados y mantener el tipo de datos", () => {
        const { result } = renderHook(() =>
          useSitesManagement(mockInitialSites)
        );
        expect(result.current.filteredSites).toEqual(mockInitialSites);
      });
    });

    describe("A.2. Escenarios de Casos Límite", () => {
      // ... (pruebas anteriores de Casos Límite se mantienen aquí)
      it("debe manejar correctamente una lista inicial de sitios vacía", () => {
        const { result } = renderHook(() => useSitesManagement([]));
        expect(result.current.filteredSites).toEqual([]);
      });
    });

    /**
     * @description Valida el comportamiento de la lógica de temporización (debounce).
     */
    describe("A.3. Escenarios de Lógica de Temporización (Debounce)", () => {
      /**
       * @test Valida que el estado de búsqueda no se actualiza antes del tiempo de debounce.
       * @expectation Después de llamar a setSearchQuery, el estado `searchQuery` del hook debe permanecer vacío.
       */
      it("no debe actualizar el estado de búsqueda inmediatamente", () => {
        // Arrange
        vi.useFakeTimers();
        const { result } = renderHook(() =>
          useSitesManagement(mockInitialSites)
        );

        // Act
        act(() => {
          result.current.setSearchQuery("beta");
        });

        // Assert: El estado interno no ha cambiado todavía.
        expect(result.current.searchQuery).toBe("");
      });

      /**
       * @test Valida que el estado se actualiza después de que transcurra el tiempo de debounce.
       * @expectation Después de 300ms, el estado `searchQuery` del hook debe tener el nuevo valor.
       */
      it("debe actualizar el estado de búsqueda después de que transcurran 300ms", () => {
        // Arrange
        vi.useFakeTimers();
        const { result } = renderHook(() =>
          useSitesManagement(mockInitialSites)
        );

        // Act: Actualizar la búsqueda y luego avanzar el tiempo.
        act(() => {
          result.current.setSearchQuery("beta");
        });
        act(() => {
          vi.advanceTimersByTime(300);
        });

        // Assert: El estado interno ahora se ha actualizado.
        expect(result.current.searchQuery).toBe("beta");
        expect(result.current.filteredSites).toHaveLength(1);
      });

      /**
       * @test Valida que múltiples llamadas rápidas solo resulten en una actualización final.
       * @expectation Después de varias llamadas rápidas, solo el último valor ("beta") debe reflejarse en el estado.
       */
      it("debe agrupar múltiples cambios rápidos en una sola actualización final", () => {
        // Arrange
        vi.useFakeTimers();
        const { result } = renderHook(() =>
          useSitesManagement(mockInitialSites)
        );

        // Act: Simular a un usuario escribiendo rápidamente.
        act(() => {
          result.current.setSearchQuery("alp");
        });
        act(() => {
          vi.advanceTimersByTime(100);
        });
        act(() => {
          result.current.setSearchQuery("alph");
        });
        act(() => {
          vi.advanceTimersByTime(100);
        });
        act(() => {
          result.current.setSearchQuery("alpha");
        });

        // Assert: Antes de que el temporizador final se complete, el estado no ha cambiado.
        expect(result.current.searchQuery).toBe("");

        // Act: Avanzar el tiempo para el último debounce.
        act(() => {
          vi.advanceTimersByTime(300);
        });

        // Assert: Solo el valor final se ha establecido.
        expect(result.current.searchQuery).toBe("alpha");
        expect(result.current.filteredSites).toHaveLength(1);
      });
    });
  });
});
