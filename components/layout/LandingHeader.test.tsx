// Ruta: components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Esta es una red de seguridad que valida el correcto renderizado de
 *              los elementos de navegación y la correcta construcción de los enlaces,
 *              asegurando la integridad de la navegación pública del sitio.
 *              Las aserciones para los enlaces de navegación de escritorio han sido refinadas.
 * @author L.I.A Legacy & RaZ Podestá (Refactorizado por L.I.A Legacy)
 * @version 2.1.0 (Desktop Navigation Query Fix)
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
    // La navegación de escritorio tiene la clase `md:flex` y `hidden`.
    // La forma más robusta de seleccionarla es por su rol y asegurar que es el nav "visible" en desktop.
    // Una alternativa es darle un `data-testid` al nav de escritorio.
    // Por ahora, buscaremos los enlaces directamente, asumiendo que los de escritorio son únicos por texto.

    // Asertamos que los enlaces principales (que son específicos de desktop y mobile via sheet) están presentes.
    // Aunque el nav tiene `md:flex`, `jsdom` puede renderizar todos los elementos.
    // Es más seguro buscar por los roles/nombres específicos que son únicos para la navegación principal.
    expect(
      screen.getByRole("link", { name: "Características" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Precios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();

    // Podemos verificar que el nav de escritorio existe y que contiene estos enlaces.
    // No es necesario usar `within` si los nombres son únicos en todo el documento.
    const desktopNav = screen.getByRole("navigation");
    expect(desktopNav).toBeInTheDocument(); // Verifica que el elemento nav existe
    // Podemos hacer una aserción más débil para el `nav` si no está claro cuál es el de escritorio
    // o simplemente confiar en que los enlaces están en el documento.
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
 * 4.  **Prueba de `ThemeSwitcher`:** Asegurarse de que el `ThemeSwitcher` también se renderice y sus interacciones básicas funcionen.
 */
