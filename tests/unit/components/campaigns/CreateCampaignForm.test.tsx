// tests/components/campaigns/CreateCampaignForm.test.tsx
/**
 * @file CreateCampaignForm.test.tsx
 * @description Arnés de pruebas de producción para el formulario CreateCampaignForm.
 *              Auditado para la arquitectura de pruebas paralela. Valida que el
 *              componente de presentación puro invoque correctamente su callback
 *              `onSubmit` y refleje el estado de `isPending`.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Parallel Architecture Migration)
 * @see {@link file://../../../components/campaigns/CreateCampaignForm.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// --- INICIO DE REFACTORIZACIÓN CRÍTICA ---
// Se utiliza el alias `@/` para la importación del componente.
import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm";
// --- FIN DE REFACTORIZACIÓN CRÍTICA ---

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
    const submitButton = screen.getByRole("button", { name: /Crear Campaña/i });
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

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que el formulario (labels, inputs, roles) cumple con los estándares WCAG.
 *
 * @subsection Mejoras Implementadas
 * 1. **Corrección de Importación**: ((Implementada)) La importación del componente bajo prueba se ha corregido para usar el alias `@/`.
 * 2. **Validación de Estado de Carga**: ((Implementada)) La suite ya incluye una prueba robusta para el estado `isPending`.
 */
// tests/components/campaigns/CreateCampaignForm.test.tsx
