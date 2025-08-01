// app/[locale]/dashboard/sites/sites-client.test.tsx
/**
 * @file sites-client.test.tsx
 * @description Arnés de pruebas de producción para el componente orquestador SitesClient.
 *              Este arnés valida que el componente pase correctamente las props a sus
 *              componentes hijos y maneje los estados de la UI. La estrategia de prueba
 *              ha sido refactorizada para usar espías (`vi.spyOn`) en lugar de
 *              serialización de props, garantizando una validación fiable de las
 *              funciones de callback.
 * @author L.I.A. Legacy
 * @version 2.0.0 (Direct Prop Spy & High-Fidelity Mocking)
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import * as SitesHeaderModule from "@/components/sites/SitesHeader";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";
import { SitesClient } from "./sites-client";

// --- Simulación de Dependencias ---
// Mockear los componentes hijos que no son el objetivo principal de la prueba.
vi.mock("@/components/sites/SitesGrid", () => ({
  SitesGrid: () => <div data-testid="mock-sites-grid" />,
}));
vi.mock("@/components/sites/PaginationControls", () => ({
  PaginationControls: () => <div data-testid="mock-pagination-controls" />,
}));

// Mockear los hooks de los que depende el componente.
vi.mock("@/lib/context/DashboardContext");
vi.mock("@/lib/hooks/useSitesManagement");

// --- Datos de Prueba de Alta Fidelidad ---
const mockSitesData: SiteWithCampaignsCount[] = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    name: "Sitio de Prueba Alfa",
    subdomain: "alfa-test",
    description: "Descripción del sitio de prueba Alfa.",
    icon: "🧪",
    created_at: new Date().toISOString(),
    updated_at: null,
    workspace_id: "ws-123",
    owner_id: "user-456",
    custom_domain: null,
    campaigns: [{ count: 5 }],
  },
];
const mockActiveWorkspace = { id: "ws-123", name: "Test Workspace" };

describe("Arnés de Pruebas: SitesClient Orchestrator", () => {
  it("debe pasar todas las props correctas a sus componentes hijos", () => {
    // Arrange
    // Se crea un espía en el componente SitesHeader antes de cada prueba.
    const sitesHeaderSpy = vi
      .spyOn(SitesHeaderModule, "SitesHeader")
      .mockImplementation(() => <div data-testid="mock-sites-header" />);

    vi.mocked(useDashboard).mockReturnValue({
      activeWorkspace: mockActiveWorkspace,
    } as any);

    const mockHandleSearch = vi.fn();
    vi.mocked(useSitesManagement).mockReturnValue({
      sites: mockSitesData,
      isCreateDialogOpen: false,
      setCreateDialogOpen: vi.fn(),
      handleDelete: vi.fn(),
      isPending: false,
      deletingSiteId: null,
      handleSearch: mockHandleSearch,
    });

    const props = {
      initialSites: mockSitesData,
      totalCount: 1,
      page: 1,
      limit: 9,
      searchQuery: "test",
    };

    // Act
    render(<SitesClient {...props} />);

    // Assert: Verificar que el componente espiado fue llamado
    expect(sitesHeaderSpy).toHaveBeenCalledTimes(1);

    // Assert: Inspeccionar las props pasadas al componente espiado
    const passedProps = sitesHeaderSpy.mock.calls[0][0];
    expect(passedProps.searchQuery).toBe("test");
    expect(passedProps.workspaceId).toBe("ws-123");
    expect(passedProps.onSearchChange).toBe(mockHandleSearch);
    expect(passedProps.onSearchChange).toBeInstanceOf(Function);

    // Limpiar el espía después de la prueba
    sitesHeaderSpy.mockRestore();
  });

  it("no debe renderizar nada si no hay un workspace activo", () => {
    // Arrange
    vi.mocked(useDashboard).mockReturnValue({
      activeWorkspace: null,
    } as any);
    vi.mocked(useSitesManagement).mockReturnValue({} as any);

    // Act
    const { container } = render(
      <SitesClient
        initialSites={[]}
        totalCount={0}
        page={1}
        limit={9}
        searchQuery=""
      />
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Factoría de Mocks**: Mover la configuración de los mocks (`mockSitesData`, `mockActiveWorkspace`) a funciones de utilidad para mantener las pruebas más limpias y reutilizables.
 * 2.  **Pruebas de Accesibilidad (a11y)**: Integrar `jest-axe` para analizar el HTML renderizado y asegurar que cumple con los estándares básicos de accesibilidad, incluso con los componentes hijos mockeados.
 */
// app/[locale]/dashboard/sites/sites-client.test.tsx
