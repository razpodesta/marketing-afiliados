// tests/components/campaigns/CampaignsHeader.test.tsx (Nuevo Aparato)
/**
 * @file CampaignsHeader.test.tsx
 * @description Arnés de pruebas para el componente `CampaignsHeader`.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CampaignsHeader } from "@/components/campaigns/CampaignsHeader";

// Mocks
vi.mock("@/components/campaigns/CreateCampaignForm", () => ({
  CreateCampaignForm: () => <div data-testid="create-form-mock" />,
}));
vi.mock("@/lib/navigation", () => ({
  Link: (props: any) => <a href={props.href}>{props.children}</a>,
}));

describe("Componente: CampaignsHeader", () => {
  const user = userEvent.setup();
  const mockSetCreateDialogOpen = vi.fn();

  it("debe renderizar el nombre del subdominio en el título", () => {
    // Arrange
    render(
      <CampaignsHeader
        siteId="site-1"
        siteSubdomain="mi-sitio-unico"
        isCreateDialogOpen={false}
        setCreateDialogOpen={mockSetCreateDialogOpen}
        isCreating={false}
        onCreate={vi.fn()}
      />
    );
    // Assert
    expect(screen.getByText("mi-sitio-unico")).toBeInTheDocument();
  });

  it("debe llamar a setCreateDialogOpen(true) al hacer clic en 'Nueva Campaña'", async () => {
    // Arrange
    render(
      <CampaignsHeader
        siteId="site-1"
        siteSubdomain="mi-sitio-unico"
        isCreateDialogOpen={false}
        setCreateDialogOpen={mockSetCreateDialogOpen}
        isCreating={false}
        onCreate={vi.fn()}
      />
    );
    const createButton = screen.getByRole("button", { name: "Nueva Campaña" });

    // Act
    await user.click(createButton);

    // Assert
    // La lógica del DialogTrigger llama al onOpenChange del Dialog,
    // que a su vez llama a nuestra función.
    expect(mockSetCreateDialogOpen).toHaveBeenCalledWith(true);
  });
});
