// tests/unit/components/campaigns/CreateCampaignForm.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

/**
 * @file CreateCampaignForm.test.tsx
 * @description Arnés de pruebas para `CreateCampaignForm`, actualizado para validar
 *              que el componente consume y renderiza correctamente las claves de
 *              traducción desde el mock de `useTranslations`.
 * @author L.I.A. Legacy
 * @version 5.0.0 (I18n Validation)
 */
describe("Formulario: CreateCampaignForm", () => {
  const baseProps = {
    siteId: "site-123",
    onSubmit: vi.fn(),
  };

  it("debe renderizar los labels y placeholders desde la capa de i18n", () => {
    // Arrange
    render(<CreateCampaignForm {...baseProps} isPending={false} />);

    // Assert
    expect(
      screen.getByLabelText("CampaignsPage.form_name_label")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("CampaignsPage.form_name_placeholder")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CampaignsPage.form_create_button" })
    ).toBeInTheDocument();
  });

  it("debe mostrar el estado de carga con el texto internacionalizado", () => {
    // Arrange
    render(<CreateCampaignForm {...baseProps} isPending={true} />);

    // Assert
    expect(
      screen.getByRole("button", {
        name: "CampaignsPage.form_creating_button",
      })
    ).toBeDisabled();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Validación de Internacionalización**: ((Implementada)) La suite de pruebas ha sido actualizada para validar que todos los textos visibles del formulario se consumen correctamente desde el mock de `useTranslations`.
 *
 * @subsection Melhorias Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para asegurar que el formulario cumple con los estándares WCAG.
 */
// tests/unit/components/campaigns/CreateCampaignForm.test.tsx
