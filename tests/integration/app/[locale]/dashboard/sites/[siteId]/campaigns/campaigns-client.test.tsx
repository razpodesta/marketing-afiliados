// tests/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
/**
 * @file campaigns-client.test.tsx
 * @description Arnés de pruebas para CampaignsClient. Refactorizado para
 *              corregir la invocación del hook `useCampaignsManagement` en
 *              los mocks, resolviendo el error de compilación TS2554.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Correct Hook Mocking)
 * @see {@link file://../../../../../../app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignsClient } from "@/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client";
import { useCampaignsManagement } from "@/lib/hooks/useCampaignsManagement";

// --- Simulación de Dependencias ---
vi.mock("@/lib/hooks/useCampaignsManagement");
vi.mock("next-intl", () => ({
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));
vi.mock("@/lib/navigation", () => ({
  Link: (props: any) => {
    let finalHref = props.href;
    if (typeof props.href === "object" && props.href.pathname) {
      finalHref = props.href.pathname.replace(
        "[campaignId]",
        props.href.params.campaignId
      );
    }
    return <a href={finalHref}>{props.children}</a>;
  },
}));
vi.mock("@/components/campaigns/CreateCampaignForm", () => ({
  CreateCampaignForm: ({ onSubmit }: { onSubmit: (fd: FormData) => void }) => (
    <form
      data-testid="mock-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData());
      }}
    >
      <button type="submit">Crear</button>
    </form>
  ),
}));

// --- Datos y Mocks de Alta Fidelidad ---
const mockInitialCampaigns = [
  {
    id: "camp-1",
    name: "Campaña Alpha",
    slug: "alpha",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
];
const mockSite = { id: "site-123", subdomain: "mi-sitio" };
const mockHandleDelete = vi.fn();
const mockHandleCreate = vi.fn();

// Estructura de mock por defecto para ser reutilizada y sobrescrita
const defaultMockHookValue = {
  campaigns: mockInitialCampaigns,
  isCreateDialogOpen: true,
  setCreateDialogOpen: vi.fn(),
  isPending: false,
  mutatingId: null,
  handleDelete: mockHandleDelete,
  handleCreate: mockHandleCreate,
};

describe("Arnés de Pruebas: CampaignsClient", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCampaignsManagement).mockReturnValue(
      defaultMockHookValue as any
    );
  });

  it("Prueba de Estado Vacío: debe renderizar el mensaje correcto cuando no hay campañas", () => {
    // Arrange
    // REFACTORIZACIÓN CRÍTICA (TS2554): Se provee un objeto de mock completo
    // en lugar de invocar el hook real, respetando el contrato de la función.
    vi.mocked(useCampaignsManagement).mockReturnValue({
      ...defaultMockHookValue,
      campaigns: [], // Sobrescribir solo la propiedad necesaria
    });

    render(
      <CampaignsClient
        site={mockSite}
        initialCampaigns={[]}
        totalCount={0}
        page={1}
        limit={10}
      />
    );

    // Assert
    expect(
      screen.getByText("No se han creado campañas para este sitio todavía.")
    ).toBeInTheDocument();
  });

  it("debe invocar handleCreate del hook cuando se envía el formulario", async () => {
    // Arrange
    render(
      <CampaignsClient
        site={mockSite}
        initialCampaigns={mockInitialCampaigns as any}
        totalCount={1}
        page={1}
        limit={10}
      />
    );

    // Act
    const formSubmitButton = screen.getByRole("button", { name: /Crear/i });
    await user.click(formSubmitButton);

    // Assert
    await waitFor(() => {
      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado.
 *
 * @subsection Mejoras Implementadas
 * 1. **Mock de Hook Correcto**: ((Implementada)) Se ha corregido el error `TS2554` al reemplazar la llamada incorrecta a `useCampaignsManagement()` en el mock por un objeto de retorno correctamente estructurado, eliminando la deuda de integridad en la prueba.
 */
// tests/app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
