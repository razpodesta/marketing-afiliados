// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
/**
 * @file campaigns-client.test.tsx
 * @description Arnés de pruebas para CampaignsClient. Valida el renderizado,
 *              la interacción con los diálogos y, crucialmente, la correcta
 *              invocación de los manejadores del hook `useCampaignsManagement`.
 *              Se ha corregido el aislamiento de estado entre pruebas.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 2.1.0 (Test State Isolation Fix)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCampaignsManagement } from "@/lib/hooks/useCampaignsManagement";
import { CampaignsClient } from "./campaigns-client";

// --- Simulación de Dependencias ---
vi.mock("@/lib/hooks/useCampaignsManagement");
vi.mock("next-intl", () => ({
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));
vi.mock("@/lib/navigation", () => ({
  Link: (props: any) => <a {...props}>{props.children}</a>,
}));
vi.mock("@/components/campaigns/CreateCampaignForm", () => ({
  CreateCampaignForm: ({
    onSubmit,
    isPending,
  }: {
    onSubmit: (fd: FormData) => void;
    isPending: boolean;
  }) => (
    <form
      data-testid="mock-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <button type="submit" disabled={isPending}>
        Crear
      </button>
    </form>
  ),
}));

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

describe("Arnés de Pruebas: CampaignsClient", () => {
  const user = userEvent.setup();
  const mockHandleDelete = vi.fn();
  const mockHandleCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe invocar handleCreate del hook cuando se envía el formulario", async () => {
    // Arrange: Configuración específica para esta prueba
    vi.mocked(useCampaignsManagement).mockReturnValue({
      campaigns: mockInitialCampaigns,
      isCreateDialogOpen: true, // Abrir el diálogo solo para esta prueba
      setCreateDialogOpen: vi.fn(),
      isPending: false,
      mutatingId: null,
      handleDelete: mockHandleDelete,
      handleCreate: mockHandleCreate,
    } as any);

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

  it("debe invocar handleDelete del hook cuando se confirma la eliminación", async () => {
    // Arrange: Configuración específica para esta prueba
    vi.mocked(useCampaignsManagement).mockReturnValue({
      campaigns: mockInitialCampaigns,
      isCreateDialogOpen: false, // Asegurarse de que el diálogo de creación esté cerrado
      setCreateDialogOpen: vi.fn(),
      isPending: false,
      mutatingId: null,
      handleDelete: mockHandleDelete,
      handleCreate: mockHandleCreate,
    } as any);

    render(
      <CampaignsClient
        site={mockSite}
        initialCampaigns={mockInitialCampaigns as any}
        totalCount={1}
        page={1}
        limit={10}
      />
    );
    const deleteTriggerButton = screen.getByLabelText(
      "Eliminar la campaña Campaña Alpha"
    );
    await user.click(deleteTriggerButton);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    const confirmButton = screen.getByRole("button", { name: /Sí, eliminar/i });

    // Act
    await user.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Estado Vacío**: (Vigente) Añadir un test que pase un array de campañas vacío y verifique que se renderiza el mensaje "No se han creado campañas".
 * 2.  **Prueba de Navegación**: (Vigente) Validar que los `href` de los enlaces de "Editar" y "Volver" se construyen correctamente con los IDs esperados.
 */
// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.test.tsx
