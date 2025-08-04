// tests/components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Ha sido refactorizado para que el mock del componente `SheetTrigger` respete la
 *              prop `asChild`, resolviendo la advertencia de anidamiento de DOM
 *              (`validateDOMNesting`) y asegurando la integridad estructural de las pruebas.
 * @author L.I.A Legacy
 * @version 4.2.0 (asChild-Aware Mocking)
 * @see {@link file://../../../components/layout/LandingHeader.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { LandingHeader } from "@/components/layout/LandingHeader";

// --- Simulación de Dependencias ---
vi.mock("next/link", () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{props.children}</a>
  ),
}));

vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher-mock" />,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-menu">{children}</div>
  ),
  // --- INICIO DE REFACTORIZACIÓN DEL MOCK ---
  // Este mock ahora es "inteligente". Detecta si se le pasa `asChild` y ajusta
  // su renderizado para evitar anidar botones, resolviendo el warning de DOM.
  SheetTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <button aria-label="Abrir menú">{children}</button>;
  },
  // --- FIN DE REFACTORIZACIÓN DEL MOCK ---
}));

vi.mock("next/image", () => ({
  default: ({
    priority,
    ...props
  }: {
    priority?: boolean;
    [key: string]: any;
  }) => <img {...props} data-priority={priority ? "true" : "false"} />,
}));

describe("Componente: LandingHeader", () => {
  const user = userEvent.setup();

  it("debe renderizar los enlaces de navegación principales en la vista de escritorio", () => {
    // Arrange
    render(<LandingHeader />);
    const desktopNav = screen.getByRole("navigation", {
      name: "Navegación Principal",
    });

    // Assert
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

  it("debe renderizar los enlaces y el LanguageSwitcher dentro del menú móvil", async () => {
    // Arrange
    render(<LandingHeader />);

    // Act
    const mobileMenu = screen.getByTestId("mobile-menu");

    // Assert
    expect(
      within(mobileMenu).getByRole("link", { name: "Características" })
    ).toBeInTheDocument();
    expect(
      within(mobileMenu).getByTestId("language-switcher-mock")
    ).toBeInTheDocument();
    expect(
      within(mobileMenu).getByRole("link", { name: "Iniciar Sesión" })
    ).toBeInTheDocument();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Estado de Autenticación**: ((Vigente)) Modificar `LandingHeader` para aceptar una prop de sesión y verificar que los botones de "Iniciar Sesión" se reemplacen por un menú de perfil si el usuario está autenticado.
 * 2. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado.
 *
 * @subsection Mejoras Implementadas
 * 1. **Mock `asChild`-Aware**: ((Implementada)) Se ha refactorizado el mock de `SheetTrigger` para manejar correctamente la prop `asChild`, resolviendo la advertencia `validateDOMNesting` de raíz.
 */
// tests/components/layout/LandingHeader.test.tsx
