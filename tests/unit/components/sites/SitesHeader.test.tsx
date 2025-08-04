// tests/components/sites/SitesHeader.test.tsx
/**
 * @file SitesHeader.test.tsx
 * @description Arnés de pruebas de producción para el componente SitesHeader.
 *              Valida que el componente renderice correctamente su UI y que las
 *              interacciones del usuario (búsqueda, apertura de diálogo) invoquen
 *              correctamente las funciones de callback pasadas como props.
 * @author L.I.A. Legacy
 * @version 2.0.0 (Parallel Architecture Migration)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { SitesHeader } from "@/components/sites/SitesHeader";

// --- Simulación de Dependencias ---
vi.mock("@/components/sites/CreateSiteForm", () => ({
  CreateSiteForm: () => <div data-testid="mock-create-site-form" />,
}));
// Mock de framer-motion para evitar errores en el entorno de pruebas
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
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

    const TestWrapper = () => {
      const [query, setQuery] = React.useState("");
      const handleChange = (newQuery: string) => {
        setQuery(newQuery);
        mockOnSearchChange(newQuery);
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
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(4, "test");
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
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que todos los elementos interactivos cumplen con los estándares WCAG.
 *
 * @subsection Mejoras Implementadas
 * 1. **Corrección de Rutas de Importación**: ((Implementada)) Se han corregido las importaciones para usar alias, resolviendo el fallo de inicialización.
 * 2. **Mock de `framer-motion`**: ((Implementada)) Se ha añadido un mock para `framer-motion` para asegurar que las pruebas no fallen debido a la nueva animación de UI.
 */
// tests/components/sites/SitesHeader.test.tsx
