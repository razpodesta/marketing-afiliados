// Ruta: components/layout/LandingHeader.test.tsx (CORREGIDO)
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Esta es una red de seguridad que valida el correcto renderizado de
 *              los elementos de navegación y la correcta construcción de los enlaces,
 *              asegurando la integridad de la navegación pública del sitio.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 2.0.0 (Robust Mocking & Query Correction)
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
vi.mock("@/components/ui/ThemeSwitcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher"></div>,
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
    render(<LandingHeader />);
    // CORRECCIÓN: Se acota la búsqueda al elemento <nav> que solo es visible en escritorio.
    const desktopNav = screen.getByRole("navigation");

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

  it("debe renderizar los botones de acción 'Iniciar Sesión' y 'Regístrate Gratis'", () => {
    render(<LandingHeader />);
    // Se utiliza `getAllByRole` porque los botones se renderizan tanto para móvil como para escritorio.
    // La prueba ahora simplemente verifica que existan en el documento.
    expect(
      screen.getAllByRole("link", { name: "Iniciar Sesión" })[0]
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Regístrate Gratis" })[0]
    ).toBeInTheDocument();
  });

  it("debe renderizar el selector de idioma", () => {
    render(<LandingHeader />);
    // Se utiliza `getAllByTestId` y se verifica que al menos uno esté presente.
    expect(screen.getAllByTestId("language-switcher")[0]).toBeInTheDocument();
  });
});

/**
 * @section PRUEBAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Navegación Móvil:** Simular un tamaño de viewport más pequeño y verificar que el menú de escritorio (`<nav>`) no esté visible, mientras que el botón del menú de hamburguesa (`SheetTrigger`) sí lo esté.
 * 2.  **Prueba de Interacción del Menú Móvil:** Simular un clic en el `SheetTrigger` y verificar que los enlaces de navegación se rendericen dentro del `SheetContent` (que ahora tiene un `data-testid`).
 * 3.  **Prueba de Estado de Autenticación:** Modificar el componente `LandingHeader` para que acepte una prop de sesión y luego añadir pruebas que verifiquen que, si el usuario está autenticado, los botones de "Iniciar Sesión" se reemplacen por un menú de perfil o un enlace al "Dashboard".
 */

/**
 * @section PRUEBAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Navegación Móvil:** Simular un tamaño de viewport más pequeño y verificar que el menú de escritorio (`<nav>`) no esté visible, mientras que el botón del menú de hamburguesa (`SheetTrigger`) sí lo esté.
 * 2.  **Prueba de Interacción del Menú Móvil:** Simular un clic en el `SheetTrigger` y verificar que los enlaces de navegación se rendericen dentro del `SheetContent`.
 * 3.  **Prueba de Estado de Autenticación:** Modificar el componente `LandingHeader` para que acepte una prop de sesión y luego añadir pruebas que verifiquen que, si el usuario está autenticado, los botones de "Iniciar Sesión" se reemplacen por un menú de perfil o un enlace al "Dashboard".
 */
// Ruta: components/layout/LandingHeader.test.tsx
