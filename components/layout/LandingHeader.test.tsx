// components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Valida el correcto renderizado de los elementos de navegación y la correcta
 *              construcción de los enlaces, asegurando la integridad de la navegación
 *              pública del sitio. Las aserciones han sido refactorizadas para ser más
 *              específicas y robustas.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.0.0 (Fix: Specific DOM Querying)
 * @see {@link file://./LandingHeader.tsx} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA
 * 1.  **Selectores Específicos:** Se utiliza la utilidad `within` para limitar el
 *     alcance de las consultas al contenedor de navegación de escritorio (`<nav>`).
 *     Esto resuelve el error `Found multiple elements` al buscar elementos que
 *     existen tanto en la vista de escritorio como en la móvil.
 * 2.  **Mocking de Alto Nivel:** Las dependencias (`LanguageSwitcher`, `Sheet`) se
 *     simulan como componentes vacíos para aislar la lógica de `LandingHeader`
 *     y mantener las pruebas rápidas y enfocadas.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Interacción del Menú Móvil:** (Vigente) Simular un clic en el `SheetTrigger` y verificar que los enlaces de navegación se rendericen dentro del `SheetContent` (usando `within` en el `div` con `data-testid="mobile-menu"`).
 * 2.  **Prueba de Estado de Autenticación:** (Vigente) Modificar el componente `LandingHeader` para que acepte una prop de sesión y luego añadir pruebas que verifiquen que, si el usuario está autenticado, los botones de "Iniciar Sesión" se reemplacen por un menú de perfil.
 * 3.  **Pruebas de Accesibilidad (a11y):** (Vigente) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que cumple con los estándares WCAG.
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
  LanguageSwitcher: () => <div data-testid="language-switcher"></div>,
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

// --- Suite de Pruebas ---
describe("Componente: LandingHeader", () => {
  it("debe renderizar el logo y los enlaces de navegación principales en la vista de escritorio", () => {
    // Arrange
    render(<LandingHeader />);

    // CORRECCIÓN ESTRUCTURAL: Se busca el contenedor de navegación de escritorio primero.
    const desktopNav = screen.getByRole("navigation", {
      name: "Navegación Principal",
    });

    // Act & Assert: Se utiliza `within` para buscar solo dentro de ese contenedor.
    const linkFeatures = within(desktopNav).getByRole("link", {
      name: "Características",
    });
    const linkPricing = within(desktopNav).getByRole("link", {
      name: "Precios",
    });
    const linkFaq = within(desktopNav).getByRole("link", { name: "FAQ" });

    expect(linkFeatures).toBeInTheDocument();
    expect(linkPricing).toBeInTheDocument();
    expect(linkFaq).toBeInTheDocument();
  });

  it("debe renderizar los botones de acción 'Iniciar Sesión' y 'Regístrate Gratis'", () => {
    render(<LandingHeader />);
    expect(
      screen.getAllByRole("link", { name: "Iniciar Sesión" })[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Regístrate Gratis" })[0]
    ).toBeInTheDocument();
  });
});
// components/layout/LandingHeader.test.tsx
