// app/[locale]/dashboard/sites/page.test.tsx
/**
 * @file page.test.tsx
 * @description Arnés de pruebas de alta fidelidad para el Server Component de
 *              la página de Sitios. Valida los flujos de datos y la lógica de
 *              negocio del `SitesPageLoader` de forma aislada y robusta.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Definitive Isolated Loader Validation)
 */
import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { SitesPageLoader } from "./page";
// `SitesClient` se importa solo para que el mock funcione
import { SitesClient } from "./sites-client";

// --- Simulación de Dependencias ---
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers");
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data");
// Se mockea el componente cliente para aislar completamente el loader del servidor.
vi.mock("./sites-client", () => ({
  SitesClient: vi.fn((props) => (
    <div data-testid="mock-sites-client" data-props={JSON.stringify(props)} />
  )),
}));

const mockUser = { id: "user-123" };
const mockWorkspaceId = "ws-456";

describe("Arnés de Pruebas Definitivo: app/[locale]/dashboard/sites/page.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    } as any);
    vi.mocked(cookies).mockReturnValue({
      get: (name: string) =>
        name === "active_workspace_id" ? { value: mockWorkspaceId } : undefined,
    } as any);
    vi.mocked(sitesData.getSitesByWorkspaceId).mockResolvedValue({
      sites: [],
      totalCount: 0,
    });
  });

  it("Prueba de Paginación: debe pasar el parámetro `page` a la capa de datos", async () => {
    const LoaderComponent = await SitesPageLoader({
      searchParams: { page: "3" },
    });
    render(LoaderComponent);

    expect(sitesData.getSitesByWorkspaceId).toHaveBeenCalledWith(
      mockWorkspaceId,
      expect.objectContaining({ page: 3 })
    );
  });

  it("Prueba de Búsqueda: debe pasar el parámetro `q` a la capa de datos", async () => {
    const searchQuery = "mi-busqueda";
    const LoaderComponent = await SitesPageLoader({
      searchParams: { q: searchQuery },
    });
    render(LoaderComponent);

    expect(sitesData.getSitesByWorkspaceId).toHaveBeenCalledWith(
      mockWorkspaceId,
      expect.objectContaining({ query: searchQuery })
    );
  });

  it("Validación de Props del Cliente: debe pasar todas las props correctas a SitesClient", async () => {
    const mockResponse = { sites: [{ id: "site-1" }] as any, totalCount: 1 };
    vi.mocked(sitesData.getSitesByWorkspaceId).mockResolvedValue(mockResponse);
    const searchQuery = "mi-busqueda";
    const page = 2;

    const LoaderComponent = await SitesPageLoader({
      searchParams: { q: searchQuery, page: String(page) },
    });
    render(LoaderComponent);

    const clientProps = JSON.parse(
      screen.getByTestId("mock-sites-client").dataset.props!
    );

    expect(clientProps.initialSites).toEqual(mockResponse.sites);
    expect(clientProps.totalCount).toBe(mockResponse.totalCount);
    expect(clientProps.page).toBe(page);
    expect(clientProps.searchQuery).toBe(searchQuery);
  });

  it("Prueba de Flujo de Error: debe renderizar el componente de error si la capa de datos falla", async () => {
    vi.mocked(sitesData.getSitesByWorkspaceId).mockRejectedValue(
      new Error("DB Error")
    );

    const LoaderComponent = await SitesPageLoader({ searchParams: {} });
    render(LoaderComponent);

    const errorTitle = await screen.findByText("Error al Cargar Sitios");
    expect(errorTitle).toBeInTheDocument();
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Escenario de `DEV_MODE`**: (Vigente) Añadir una prueba que establezca `process.env.DEV_MODE_ENABLED` a `"true"` y verifique que `SitesClient` es llamado con los datos de `mockSites`, validando el bypass de desarrollo.
 * 2.  **Pruebas de Autenticación y Contexto**: (Vigente) Añadir pruebas para los casos en que `getUser` devuelve `null` o la cookie de `workspaceId` no está presente, y verificar que la función `redirect` es llamada con la URL correcta.
 * 3.  **Factoría de Mocks**: (Vigente) Mover la configuración repetitiva de mocks a una función `setupMocks()` o a un archivo de utilidades para mantener las pruebas más limpias.
 */
// app/[locale]/dashboard/sites/page.test.tsx
