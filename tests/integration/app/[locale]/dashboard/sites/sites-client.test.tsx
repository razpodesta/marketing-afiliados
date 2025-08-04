// tests/app/[locale]/dashboard/sites/sites-client.test.tsx
/**
 * @file sites-client.test.tsx
 * @description Arnés de pruebas para SitesClient. Ha sido refactorizado para
 *              utilizar `vi.hoisted` para la declaración de mocks de componentes,
 *              resolviendo de forma definitiva el problema de inicialización (`ReferenceError`)
 *              y garantizando la fiabilidad y la correcta inspección de las props.
 * @author L.I.A. Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 9.0.0 (Vi.hoisted for Definitive Mocking Stability)
 * @see {@link file://../../../../app/[locale]/dashboard/sites/sites-client.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SitesClient } from "@/app/[locale]/dashboard/sites/sites-client";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
// Usar `vi.hoisted` para declarar los mocks que serán usados en la factoría `vi.mock`.
const hoistedMocks = vi.hoisted(() => {
  const mockSitesHeader = vi.fn(
    ({
      searchQuery,
      onSearchChange,
    }: {
      searchQuery: string;
      onSearchChange: (q: string) => void;
    }) => (
      <div data-testid="sites-header">
        <input
          aria-label="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    )
  );

  const mockSitesGrid = vi.fn((props) => {
    // Las props se acceden directamente del historial de llamadas del mock en la prueba.
    return <div data-testid="sites-grid" />;
  });

  const mockPaginationControls = vi.fn((props) => (
    <div data-testid="pagination-controls" data-props={JSON.stringify(props)} />
  ));

  return {
    mockSitesHeader,
    mockSitesGrid,
    mockPaginationControls,
  };
});

// Mocks de componentes hijos para aislarlos y espiar sus props.
vi.mock("@/components/sites", () => ({
  SitesHeader: hoistedMocks.mockSitesHeader,
  SitesGrid: hoistedMocks.mockSitesGrid,
  PaginationControls: hoistedMocks.mockPaginationControls,
}));
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

// --- Simulación de Dependencias de Hooks ---
vi.mock("@/lib/hooks/useSitesManagement");
vi.mock("@/lib/context/DashboardContext");

// --- Datos de Prueba de Alta Fidelidad ---
const mockSites: SiteWithCampaignsCount[] = [
  {
    id: "site-1",
    name: "Mi Sitio de Prueba",
    subdomain: "mi-sitio",
    description: null,
    icon: "🧪",
    created_at: new Date().toISOString(),
    updated_at: null,
    workspace_id: "ws-123",
    owner_id: "user-123",
    custom_domain: null,
    campaigns: [{ count: 3 }],
  },
];
const mockHandleDelete = vi.fn();
const mockHandleSearch = vi.fn();

describe("Arnés de Pruebas: tests/app/[locale]/dashboard/sites/sites-client.test.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar los mocks hoisted para aislar las pruebas.
    hoistedMocks.mockSitesHeader.mockClear();
    hoistedMocks.mockSitesGrid.mockClear();
    hoistedMocks.mockPaginationControls.mockClear();

    vi.mocked(useSitesManagement).mockReturnValue({
      sites: mockSites,
      isCreateDialogOpen: false,
      setCreateDialogOpen: vi.fn(),
      handleDelete: mockHandleDelete,
      isPending: false,
      deletingSiteId: null,
      handleSearch: mockHandleSearch,
    });
    vi.mocked(useDashboard).mockReturnValue({
      activeWorkspace: { id: "ws-123" },
    } as any);
  });

  it("debe pasar la lista de sitios y el manejador `onDelete` a SitesGrid", () => {
    // Arrange
    render(
      <SitesClient
        initialSites={mockSites}
        totalCount={1}
        page={1}
        limit={10}
        searchQuery=""
      />
    );

    // Assert
    // Acceder a las props del mock SitesGrid a través de su historial de llamadas.
    expect(hoistedMocks.mockSitesGrid).toHaveBeenCalledTimes(1);
    const receivedGridProps = hoistedMocks.mockSitesGrid.mock.calls[0][0]; // Accede a las props del primer render
    expect(receivedGridProps.sites).toEqual(mockSites);
    expect(receivedGridProps.onDelete).toBeDefined();
    expect(receivedGridProps.onDelete).toBe(mockHandleDelete); // Verifica que es la misma instancia de la función
  });

  // PRUEBA DE INTERACCIÓN AÑADIDA
  it("debe invocar la función `handleSearch` del hook cuando el usuario escribe en el header", async () => {
    // Arrange
    render(
      <SitesClient
        initialSites={[]}
        totalCount={0}
        page={1}
        limit={10}
        searchQuery=""
      />
    );
    const searchInput = screen.getByLabelText("search-input");

    // Act
    await user.type(searchInput, "test");

    // Assert
    expect(mockHandleSearch).toHaveBeenCalledWith("t");
    expect(mockHandleSearch).toHaveBeenCalledWith("e");
    expect(mockHandleSearch).toHaveBeenCalledWith("s");
    expect(mockHandleSearch).toHaveBeenCalledWith("t");
    expect(mockHandleSearch).toHaveBeenCalledTimes(4);
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que todos los elementos interactivos cumplen con los estándares WCAG.
 *
 * @subsection Mejoras Implementadas
 * 1. **Prueba de Interacción (Wiring)**: ((Implementada)) Se ha añadido una prueba que valida que el evento `onSearchChange` del componente hijo está correctamente "cableado" al manejador `handleSearch` del hook, fortaleciendo la validación del rol de orquestador del componente.
 * 2. **Mock de Alta Fidelidad para Funciones (ReferenceError Definitive Fix)**: ((Implementada)) Se ha resuelto el `ReferenceError` mediante el uso de `vi.hoisted` para declarar los mocks de componentes. Esto garantiza que las funciones mockeadas estén correctamente inicializadas y sean accesibles desde la factoría `vi.mock`, eliminando el problema de "hoisting".
 */
// tests/app/[locale]/dashboard/sites/sites-client.test.tsx
