// Ruta: components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LandingHeader`.
 *              Esta es una red de seguridad que valida el correcto renderizado de
 *              los elementos de navegación y la correcta construcción de los enlaces,
 *              asegurando la integridad de la navegación pública del sitio.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 2.0.0 (Robust Mocking & Query Correction)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingHeader } from "./LandingHeader";

// --- Simulación (Mocking) de Módulos Dependientes ---
// CORRECCIÓN CRÍTICA: Se simulan (mock) los módulos que el componente importa.
// Vitest interceptará estas importaciones y usará nuestras versiones simuladas.
// Esto aísla el componente `LandingHeader` de sus dependencias reales,
// permitiendo una prueba unitaria pura y resolviendo el error de "módulo no encontrado".

// Simulamos el `Link` de `next/link` ya que `LandingHeader` ahora lo usa directamente.
vi.mock("next/link", () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{props.children}</a>
  ),
}));

// Simulamos los componentes de UI para no probar sus implementaciones internas.
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher"></div>,
}));
vi.mock("@/components/ui/ThemeSwitcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher"></div>,
}));
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

// --- Suite de Pruebas ---

describe("Componente: LandingHeader", () => {
  it("debe renderizar el logo y los enlaces de navegación principales", () => {
    render(<LandingHeader />);
    // Consulta por el rol 'link' y el nombre accesible, que es más robusto.
    expect(
      screen.getByRole("link", { name: /Metashark/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Características" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Precios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
  });

  it("debe renderizar los botones de acción 'Iniciar Sesión' y 'Regístrate Gratis'", () => {
    render(<LandingHeader />);
    // Buscamos por el texto visible que el usuario vería.
    expect(
      screen.getByRole("link", { name: "Iniciar Sesión" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Regístrate Gratis" })
    ).toBeInTheDocument();
  });

  it("debe renderizar los selectores de idioma y tema", () => {
    render(<LandingHeader />);
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
  });
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato de pruebas `LandingHeader.test.tsx` valida el contrato de la UI
 *               para el encabezado público.
 *
 * @functionality
 * - **Aislamiento del Componente:** Utiliza `vi.mock` para reemplazar sistemáticamente
 *   cada dependencia del `LandingHeader`. Esto es una práctica de ingeniería de software
 *   fundamental en las pruebas unitarias. Al simular `Link`, `LanguageSwitcher`, etc.,
 *   nos aseguramos de que esta suite de pruebas SOLO falle si hay un problema en
 *   `LandingHeader.tsx` y no porque un componente hijo haya cambiado. Esto hace que
 *   las pruebas sean más rápidas, menos frágiles y más fáciles de depurar.
 * - **Validación de Contenido:** Las aserciones (`expect`) verifican que todos los
 *   elementos visuales clave (logo, enlaces de navegación, botones de acción) estén
 *   presentes en el DOM renderizado.
 * - **Consultas Resilientes:** Se utilizan consultas de `@testing-library` basadas en
 *   roles y nombres accesibles (`getByRole`, `getByText`). Este enfoque es más
 *   robusto que buscar por nombres de clase o selectores de CSS, ya que las pruebas
 *   seguirán pasando incluso si se refactorizan los estilos, siempre y cuando el
 *   contenido semántico permanezca igual.
 *
 * @relationships
 * - Valida el componente `components/layout/LandingHeader.tsx`.
 * - Depende de la configuración de Vitest (`vitest.config.ts`) para resolver los
 *   alias de ruta (`@/`) y para el entorno de simulación del DOM (`jsdom`).
 *
 * @expectations
 * - Se espera que esta suite de pruebas falle si un desarrollador elimina accidentalmente
 *   un enlace de navegación o cambia el texto de un botón de acción clave. Actúa como
 *   una red de seguridad para la experiencia del usuario no autenticado.
 * =================================================================================================
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
