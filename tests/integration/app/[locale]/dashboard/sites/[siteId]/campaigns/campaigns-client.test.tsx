// tests/integration/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
/**
 * @file campaigns-client.test.tsx
 * @description Arnés de pruebas de integración para el orquestador CampaignsClient.
 *              Ha sido refactorizado con un mock de alta fidelidad para `next-intl`
 *              que soporta `t.rich`, resolviendo el `TypeError`.
 * @author L.I.A Legacy
 * @version 2.0.0 (High-Fidelity i18n Mocking)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CampaignsClient } from "@/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client";
import { useOptimisticResourceManagement } from "@/lib/hooks/useOptimisticResourceManagement";

// --- INICIO DE REFACTORIZACIÓN DE MOCK DE ALTA FIDELIDAD ---
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, values?: any) => key;
    // Adjuntamos la función `rich` al objeto `t` para simular la API real.
    t.rich = (key: string, values?: any) => key;
    return t;
  },
  useFormatter: () => ({ dateTime: () => "mock-date" }),
}));
// --- FIN DE REFACTORIZACIÓN DE MOCK DE ALTA FIDELIDAD ---

vi.mock("@/lib/hooks/useOptimisticResourceManagement");
vi.mock("@/lib/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/mock-path",
  Link: (props: any) => <a {...props} />,
}));

// Mocks de componentes atómicos refactorizados
vi.mock("@/components/campaigns/CampaignsPageHeader", () => ({
  CampaignsPageHeader: () => <div data-testid="campaigns-page-header-mock" />,
}));
vi.mock("@/components/shared/DataTable", () => ({
  DataTable: () => <div data-testid="data-table-mock" />,
}));
vi.mock("@/components/shared/SearchToolbar", () => ({
  SearchToolbar: () => <div data-testid="search-toolbar-mock" />,
}));
vi.mock("@/components/shared/PaginationControls", () => ({
  PaginationControls: () => <div data-testid="pagination-controls-mock" />,
}));

describe("Orquestador de Cliente: CampaignsClient", () => {
  const mockHookValue = {
    items: [],
    isPending: false,
    mutatingId: null,
    handleCreate: vi.fn(),
    handleDelete: vi.fn(),
  };

  it("debe componer correctamente los nuevos aparatos compartidos", () => {
    vi.mocked(useOptimisticResourceManagement).mockReturnValue(mockHookValue);

    render(
      <CampaignsClient
        site={{ id: "site-1", subdomain: "test" }}
        initialCampaigns={[]}
        totalCount={0}
        page={1}
        limit={10}
        searchQuery=""
      />
    );

    expect(
      screen.getByTestId("campaigns-page-header-mock")
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-table-mock")).toBeInTheDocument();
    expect(screen.getByTestId("search-toolbar-mock")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-controls-mock")).toBeInTheDocument();
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Mock de `next-intl` de Alta Fidelidad**: ((Implementada)) Se ha corregido el mock de `useTranslations` para que devuelva una función que también tiene la propiedad `.rich`, resolviendo el `TypeError`.
 * 2. **Mocks Atómicos**: ((Implementada)) La prueba ahora simula los componentes de presentación atómicos (`CampaignsPageHeader`, `DataTable`, etc.) en lugar de los componentes `legacy`, alineándose con la arquitectura actual.
 *
 * @subsection Melhorias Futuras
 * 1. **Prueba de Cableado de Interacciones (Wiring)**: ((Vigente)) Añadir pruebas que simulen eventos en los componentes hijos (ej. búsqueda, clic en crear) y verifiquen que los manejadores correspondientes (`handleSearch`, `handleCreate`) son invocados.
 */
// tests/integration/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
