// components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Valida el correcto renderizado de todos los elementos de navegación,
 *              incluyendo el nuevo `LanguageSwitcher`.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.1.0 (LanguageSwitcher Integration Validation)
 * @see {@link file://./LandingHeader.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingHeader } from "./LandingHeader";

// --- Simulación (Mocking) de Módulos Dependientes ---
vi.mock("next/link", () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{props.children}</a>
  ),
}));

vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher-mock"></div>,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-menu">{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

describe("Componente: LandingHeader", () => {
  it("debe renderizar los enlaces de navegación principales en la vista de escritorio", () => {
    // Arrange
    render(<LandingHeader />);
    const desktopNav = screen.getByRole("navigation", {
      name: "Navegación Principal",
    });

    // Act & Assert
    expect(
      within(desktopNav).getByRole("link", { name: "Características" })
    ).toBeInTheDocument();
    expect(
      within(desktopNav).getByRole("link", { name: "Precios" })
    ).toBeInTheDocument();
    expect(
      within(desktopNav).getByRole("link", { name: "FAQ" })
    ).toBeInTheDocument();
  });

  it("debe renderizar el LanguageSwitcher tanto en escritorio como en móvil", () => {
    // Arrange
    render(<LandingHeader />);

    // Assert
    const switchers = screen.getAllByTestId("language-switcher-mock");
    expect(switchers.length).toBe(2); // Uno para escritorio, otro para el menú móvil.
  });
});
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Interacción del Menú Móvil:** (Vigente) Simular un clic en el `SheetTrigger` y verificar que los enlaces y el `LanguageSwitcher` se rendericen dentro del `SheetContent`.
 * 2. **Prueba de Estado de Autenticación:** (Vigente) Modificar `LandingHeader` para aceptar una prop de sesión y verificar que los botones de "Iniciar Sesión" se reemplacen por un menú de perfil si el usuario está autenticado.
 * 3. **Pruebas de Accesibilidad (a11y):** (Vigente) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que cumple con los estándares WCAG.
 */
// components/layout/LandingHeader.test.tsx
