// lib/hooks/useSitesManagement.test.ts
/**
 * @file useSitesManagement.test.ts
 * @description Suite de pruebas para el hook `useSitesManagement`.
 *              Valida la nueva lógica de navegación para la búsqueda en servidor,
 *              con un manejo robusto de temporizadores asíncronos.
 * @author L.I.A Legacy
 * @version 2.1.0 (Async Timer Stability Fix)
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePathname, useRouter } from "@/lib/navigation";
import { useSitesManagement } from "./useSitesManagement";

// --- Simulación de Dependencias ---
vi.mock("@/lib/navigation");
vi.mock("@/lib/actions", () => ({
  sites: { deleteSiteAction: vi.fn() },
}));
vi.mock("react-hot-toast");

const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
};

describe("Hook: useSitesManagement (Server-Side Search)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(usePathname).mockReturnValue("/dashboard/sites");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handleSearch: debe llamar a router.push con la query correcta después del debounce", async () => {
    const { result } = renderHook(() => useSitesManagement([]));
    act(() => {
      result.current.handleSearch("test-query");
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/dashboard/sites?q=test-query"
    );
  });

  it("handleSearch: debe eliminar el parámetro `q` si la query está vacía", async () => {
    Object.defineProperty(window, "location", {
      value: { search: "?q=initial&page=2" },
      writable: true,
    });
    const { result } = renderHook(() => useSitesManagement([]));
    act(() => {
      result.current.handleSearch("");
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/sites?");
  });
});
/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Cancelación de Debounce**: (Vigente) Añadir un test que llame a `handleSearch` varias veces dentro del tiempo de debounce y verifique que `router.push` solo es llamado una vez con el último valor.
 * 2.  **Prueba de Preservación de Parámetros**: (Nueva) Simular una URL inicial con parámetros no relacionados (ej. `?utm_source=test`) y verificar que `handleSearch` los preserva al construir la nueva URL de búsqueda.
 * 3.  **Pruebas del Flujo de Eliminación**: (Vigente) Reintroducir las pruebas para `handleDelete` para asegurar que la lógica de actualización optimista y reversión sigue funcionando correctamente después de la refactorización.
 */
// lib/hooks/useSitesManagement.test.ts
