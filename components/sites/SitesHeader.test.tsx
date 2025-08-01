// components/sites/SitesHeader.test.tsx
/**
 * @file SitesHeader.test.tsx
 * @description Arnés de pruebas de producción para el componente SitesHeader.
 *              Valida que el componente renderice correctamente su UI y que las
 *              interacciones del usuario (búsqueda, apertura de diálogo) invoquen
 *              correctamente las funciones de callback pasadas como props.
 *              La prueba de interacción del input ha sido refactorizada para simular
 *              correctamente el ciclo de vida de un componente controlado.
 * @author L.I.A. Legacy
 * @version 1.1.0 (Controlled Component Test Correction)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { SitesHeader } from "./SitesHeader";

// --- Simulación de Dependencias ---
vi.mock("@/components/sites/CreateSiteForm", () => ({
  CreateSiteForm: () => <div data-testid="mock-create-site-form" />,
}));

describe("Arnés de Pruebas: SitesHeader", () => {
  const user = userEvent.setup();

  it("debe renderizar el título, la búsqueda y el botón de creación", () => {
    // Arrange
    const props = {
      isCreateDialogOpen: false,
      setCreateDialogOpen: vi.fn(),
      searchQuery: "",
      onSearchChange: vi.fn(),
      workspaceId: "ws-123",
    };

    // Act
    render(<SitesHeader {...props} />);

    // Assert
    expect(
      screen.getByRole("heading", { name: /Mis Sitios/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Buscar por subdominio.../i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crear Sitio/i })
    ).toBeInTheDocument();
  });

  it("debe llamar a onSearchChange con el valor acumulado en cada pulsación", async () => {
    // Arrange
    const mockOnSearchChange = vi.fn();

    // Componente Wrapper para simular el estado del padre y el ciclo de re-renderizado.
    const TestWrapper = () => {
      const [query, setQuery] = React.useState("");
      const handleChange = (newQuery: string) => {
        setQuery(newQuery);
        mockOnSearchChange(newQuery); // Llamamos al spy para las aserciones
      };

      return (
        <SitesHeader
          isCreateDialogOpen={false}
          setCreateDialogOpen={() => {}}
          searchQuery={query}
          onSearchChange={handleChange}
          workspaceId="ws-123"
        />
      );
    };

    render(<TestWrapper />);
    const searchInput = screen.getByPlaceholderText(
      /Buscar por subdominio.../i
    );

    // Act
    await user.type(searchInput, "test");

    // Assert
    expect(mockOnSearchChange).toHaveBeenCalledTimes(4);
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(1, "t");
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(2, "te");
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(3, "tes");
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(4, "test");
  });

  it("debe mostrar y usar el botón de limpiar cuando hay una búsqueda activa", async () => {
    // Arrange
    const mockOnSearchChange = vi.fn();
    const props = {
      isCreateDialogOpen: false,
      setCreateDialogOpen: vi.fn(),
      searchQuery: "texto-existente",
      onSearchChange: mockOnSearchChange,
      workspaceId: "ws-123",
    };
    render(<SitesHeader {...props} />);
    const clearButton = screen.getByLabelText(/Limpiar búsqueda/i);

    // Act
    await user.click(clearButton);

    // Assert
    expect(mockOnSearchChange).toHaveBeenCalledWith("");
  });

  it("debe llamar a setCreateDialogOpen(true) al hacer clic en 'Crear Sitio'", async () => {
    // Arrange
    const mockSetCreateDialogOpen = vi.fn();
    const props = {
      isCreateDialogOpen: false,
      setCreateDialogOpen: mockSetCreateDialogOpen,
      searchQuery: "",
      onSearchChange: vi.fn(),
      workspaceId: "ws-123",
    };
    render(<SitesHeader {...props} />);
    const createButton = screen.getByRole("button", { name: /Crear Sitio/i });

    // Act
    await user.click(createButton);

    // Assert
    expect(mockSetCreateDialogOpen).toHaveBeenCalledWith(true);
  });
});
// components/sites/SitesHeader.test.tsx
