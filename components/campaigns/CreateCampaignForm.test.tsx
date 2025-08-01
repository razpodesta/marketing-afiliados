// components/campaigns/CreateCampaignForm.test.tsx
/**
 * @file CreateCampaignForm.test.tsx
 * @description Arnés de pruebas de producción para el formulario CreateCampaignForm.
 *              Valida que el componente, como componente de presentación puro,
 *              invoque correctamente su callback `onSubmit` y refleje visualmente
 *              el estado de `isPending`.
 * @author L.I.A Legacy
 * @version 3.0.0 (Presentational Component Validation)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateCampaignForm } from "./CreateCampaignForm";

describe("Arnés de Pruebas: CreateCampaignForm", () => {
  const user = userEvent.setup();

  it("debe llamar a la prop onSubmit con el FormData correcto al enviar", async () => {
    // Arrange
    const mockOnSubmit = vi.fn();
    const siteId = "site-123";
    render(
      <CreateCampaignForm
        siteId={siteId}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const nameInput = screen.getByLabelText(/Nombre de la Campaña/i);
    const submitButton = screen.getByRole("button", {
      name: /Crear Campaña/i,
    });
    const campaignName = "Mi Campaña de Prueba";

    // Act
    await user.type(nameInput, campaignName);
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const formData = mockOnSubmit.mock.calls[0][0] as FormData;
      expect(formData.get("name")).toBe(campaignName);
      expect(formData.get("siteId")).toBe(siteId);
    });
  });

  it("debe mostrar el estado de carga y deshabilitar el botón cuando isPending es true", () => {
    // Arrange
    render(
      <CreateCampaignForm
        siteId="site-123"
        onSubmit={vi.fn()}
        isPending={true}
      />
    );

    // Act
    const submitButton = screen.getByRole("button", {
      name: /Creando Campaña.../i,
    });

    // Assert
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
// components/campaigns/CreateCampaignForm.test.tsx
