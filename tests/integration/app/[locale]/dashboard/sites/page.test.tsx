// tests/app/[locale]/dashboard/sites/page.test.tsx
/**
 * @file page.test.tsx
 * @description Arnés de pruebas de alta fidelidad para la lógica de carga de datos
 *              de la página de Sitios. Migrado a la arquitectura de pruebas paralela,
 *              valida los flujos de datos, la seguridad y los modos de ejecución.
 * @author L.I.A. Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 7.0.0 (Parallel Architecture & Dev Mode Validation)
 * @see {@link file://../../../../app/[locale]/dashboard/sites/sites-page-loader.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SitesPageLoader } from "@/app/[locale]/dashboard/sites/sites-page-loader";
import { sites as sitesData } from "@/lib/data";
import { mockSites } from "@/lib/dev/mock-session";
import { createClient } from "@/lib/supabase/server";

// --- Simulación de Dependencias ---
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers");
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data");
vi.mock("@/lib/dev/mock-session");
vi.mock("@/app/[locale]/dashboard/sites/sites-client", () => ({
  SitesClient: vi.fn((props) => (
    <div data-testid="mock-sites-client" data-props={JSON.stringify(props)} />
  )),
}));

const mockUser = { id: "user-123" };
const mockWorkspaceId = "ws-456";

describe("Arnés de Pruebas: tests/app/[locale]/dashboard/sites/page.test.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("process", {
      ...process,
      env: { ...process.env, DEV_MODE_ENABLED: "false" },
    });
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Seguridad: debe redirigir a /login si no hay usuario autenticado", async () => {
    // Arrange
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as any);

    // Act
    const LoaderComponent = await SitesPageLoader({ searchParams: {} });
    render(LoaderComponent);

    // Assert
    expect(redirect).toHaveBeenCalledWith("/login?next=/dashboard/sites");
  });

  it("Modo DEV: debe usar los datos de mock si DEV_MODE_ENABLED es true", async () => {
    // Arrange
    vi.stubGlobal("process", {
      ...process,
      env: { ...process.env, DEV_MODE_ENABLED: "true" },
    });

    // Act
    const LoaderComponent = await SitesPageLoader({ searchParams: {} });
    render(LoaderComponent);

    // Assert
    expect(sitesData.getSitesByWorkspaceId).not.toHaveBeenCalled();
    const clientProps = JSON.parse(
      screen.getByTestId("mock-sites-client").dataset.props!
    );
    expect(clientProps.initialSites).toEqual(mockSites);
  });

  it("Prueba de Búsqueda: debe pasar el parámetro `q` a la capa de datos", async () => {
    // Arrange
    const searchQuery = "mi-busqueda";

    // Act
    const LoaderComponent = await SitesPageLoader({
      searchParams: { q: searchQuery },
    });
    render(LoaderComponent);

    // Assert
    expect(sitesData.getSitesByWorkspaceId).toHaveBeenCalledWith(
      mockWorkspaceId,
      expect.objectContaining({ query: searchQuery })
    );
  });
});

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * @subsection Mejoras Futuras
 * 1. **Factoría de Mocks Compartida**: ((Vigente)) Mover la configuración repetitiva de mocks a un archivo de utilidades de prueba para mantener las pruebas más limpias.
 *
 * @subsection Mejoras Implementadas
 * 1. **Prueba de Escenario de `DEV_MODE`**: ((Implementada)) Se ha añadido una prueba que valida el flujo de datos en modo de desarrollo.
 * 2. **Prueba de Autenticación**: ((Implementada)) Se ha añadido una prueba que valida la redirección de seguridad cuando el usuario no está autenticado.
 * 3. **Migración a Arquitectura Paralela**: ((Implementada)) El archivo ahora reside en la carpeta `/tests`.
 */
// tests/app/[locale]/dashboard/sites/page.test.tsx
