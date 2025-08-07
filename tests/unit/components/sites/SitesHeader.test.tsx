// tests/unit/components/sites/SitesHeader.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { SitesHeader } from "@/components/sites/SitesHeader";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));
vi.mock("@/components/sites/CreateSiteForm", () => ({
  CreateSiteForm: () => <div data-testid="mock-create-site-form" />,
}));
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

/**
 * @file SitesHeader.test.tsx
 * @description Arnés de pruebas para `SitesHeader`, validando que el componente
 *              consume y renderiza correctamente las claves de traducción.
 * @author L.I.A. Legacy
 * @version 3.0.1 (No logical changes)
 */
describe("Arnés de Pruebas: SitesHeader", () => {
  const user = userEvent.setup();
  const mockSetCreateDialogOpen = vi.fn();
  const mockOnSearchChange = vi.fn();

  const baseProps = {
    isCreateDialogOpen: false,
    setCreateDialogOpen: mockSetCreateDialogOpen,
    onSearchChange: mockOnSearchChange,
    workspaceId: "ws-123",
    onCreate: vi.fn(),
    isPending: false,
  };

  it("debe renderizar todos los textos desde la capa de i18n", () => {
    // Arrange
    render(<SitesHeader {...baseProps} searchQuery="" />);

    // Assert
    expect(
      screen.getByRole("heading", { name: "SitesPage.header_title" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("SitesPage.header_description")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("SitesPage.search_placeholder")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "SitesPage.createSite_button" })
    ).toBeInTheDocument();
  });

  it("debe renderizar el botón de limpiar búsqueda con su aria-label traducido cuando hay una query", () => {
    // Arrange
    render(<SitesHeader {...baseProps} searchQuery="test" />);

    // Assert
    expect(
      screen.getByLabelText("SitesPage.clear_search_aria")
    ).toBeInTheDocument();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Validación de Internacionalización**: ((Implementada)) La suite de pruebas ha sido actualizada para validar que todos los textos visibles del componente se consumen correctamente desde el mock de `useTranslations`.
 *
 * @subsection Melhorias Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para asegurar que el componente cumple con los estándares WCAG.
 */
// tests/unit/components/sites/SitesHeader.test.tsx
