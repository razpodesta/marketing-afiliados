// tests/unit/components/sites/CreateSiteForm.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type UseFormReturn } from "react-hook-form";

import { CreateSiteForm } from "@/components/sites/CreateSiteForm";
import { sites as sitesActions } from "@/lib/actions";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

vi.mock("@/components/sites/SubdomainInput", () => ({
  SubdomainInput: ({ form }: { form: UseFormReturn<any> }) => (
    <input
      aria-label="subdomain-input"
      data-testid="subdomain-input"
      placeholder="SitesPage.form_subdomain_placeholder"
      {...form.register("subdomain")}
    />
  ),
}));

vi.mock("@/lib/actions", () => ({
  sites: { createSiteAction: vi.fn() },
}));

/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas para `CreateSiteForm`, actualizada para validar
 *              que el componente consume y renderiza correctamente las claves de
 *              traducción desde el mock de `useTranslations`.
 * @author L.I.A. Legacy
 * @version 22.0.0 (I18n Validation)
 */
describe("Formulario: CreateSiteForm", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar los labels y placeholders desde la capa de i18n", () => {
    // Arrange
    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123"
        isPending={false}
      />
    );

    // Assert
    expect(
      screen.getByLabelText("SitesPage.form_name_label")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("SitesPage.form_name_placeholder")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("SitesPage.form_subdomain_placeholder")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "SitesPage.form_create_button" })
    ).toBeInTheDocument();
  });

  it("debe mostrar el estado de carga con el texto internacionalizado", () => {
    // Arrange
    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123"
        isPending={true}
      />
    );

    // Assert
    expect(
      screen.getByRole("button", { name: "SitesPage.form_creating_button" })
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
// tests/unit/components/sites/CreateSiteForm.test.tsx
