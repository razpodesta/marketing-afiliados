// tests/integration/app/[locale]/dashboard/sites/sites-client.test.tsx
/**
 * @file sites-client.test.tsx
 * @description Arnés de pruebas para SitesClient. Ha sido refactorizado
 *              para alinearse con el contrato de hook `useSitesManagement`
 *              actualizado, resolviendo el error de compilación.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 9.1.0 (Hook Contract Synchronization)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SitesClient } from "@/app/[locale]/dashboard/sites/sites-client";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

const hoistedMocks = vi.hoisted(() => {
  // ... (hoisted mocks sin cambios)
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

vi.mock("@/components/sites", () => ({
  SitesHeader: hoistedMocks.mockSitesHeader,
  SitesGrid: hoistedMocks.mockSitesGrid,
  PaginationControls: hoistedMocks.mockPaginationControls,
}));

vi.mock("@/lib/hooks/useSitesManagement");
vi.mock("@/lib/context/DashboardContext");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) => key,
}));

const mockSites: SiteWithCampaignsCount[] = [
  {
    id: "site-1",
    name: "Mi Sitio de Prueba",
    description: null,
    subdomain: "mi-sitio",
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
const mockHandleCreate = vi.fn();

describe("Arnés de Pruebas: tests/app/[locale]/dashboard/sites/sites-client.test.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    hoistedMocks.mockSitesHeader.mockClear();
    hoistedMocks.mockSitesGrid.mockClear();
    hoistedMocks.mockPaginationControls.mockClear();

    // --- INICIO DE CORRECCIÓN (TS2353) ---
    // El mock ahora devuelve `mutatingId` en lugar de `deletingSiteId`
    // para coincidir con el contrato del hook `useSitesManagement`.
    vi.mocked(useSitesManagement).mockReturnValue({
      sites: mockSites,
      isCreateDialogOpen: false,
      setCreateDialogOpen: vi.fn(),
      handleDelete: mockHandleDelete,
      isPending: false,
      mutatingId: null,
      handleSearch: mockHandleSearch,
      handleCreate: mockHandleCreate,
    });
    // --- FIN DE CORRECCIÓN ---

    vi.mocked(useDashboard).mockReturnValue({
      activeWorkspace: { id: "ws-123" },
    } as any);
  });

  it("debe pasar la lista de sitios y el manejador `onDelete` a SitesGrid", () => {
    render(
      <SitesClient
        initialSites={mockSites}
        totalCount={1}
        page={1}
        limit={10}
        searchQuery=""
      />
    );
    expect(hoistedMocks.mockSitesGrid).toHaveBeenCalledTimes(1);
    const receivedGridProps = hoistedMocks.mockSitesGrid.mock.calls[0][0];
    expect(receivedGridProps.sites).toEqual(mockSites);
    expect(receivedGridProps.onDelete).toBe(mockHandleDelete);
  });

  it("debe invocar la función `handleSearch` del hook cuando el usuario escribe en el header", async () => {
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
    await user.type(searchInput, "test");
    expect(mockHandleSearch).toHaveBeenCalledTimes(4);
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronización de Contrato de Hook**: ((Implementada)) Se ha actualizado el mock de `useSitesManagement` para que devuelva `mutatingId` en lugar de la propiedad obsoleta `deletingSiteId`, resolviendo el error de compilación `TS2353`.
 */
// tests/integration/app/[locale]/dashboard/sites/sites-client.test.tsx
