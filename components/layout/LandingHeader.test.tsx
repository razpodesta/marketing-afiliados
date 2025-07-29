/**
 * @file components/layout/LandingHeader.test.tsx
 * @description Pruebas unitarias para el componente `LandingHeader`.
 * @author L.I.A Legacy
 * @version 1.1.0 (Corrected Queries)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Link } from "@/navigation";

import { LandingHeader } from "./LandingHeader";

vi.mock("@/navigation", () => ({
  Link: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{props.children}</a>
  ),
}));
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div>Language Switcher</div>,
}));

describe("Componente: LandingHeader", () => {
  it("debe renderizar la cabecera correctamente", () => {
    render(<LandingHeader />);
    // CORRECCIÓN: El logo es un enlace, no un encabezado. Se busca por el rol de enlace.
    expect(
      screen.getByRole("link", { name: /metashark/i })
    ).toBeInTheDocument();
  });
  // ... (el resto de las pruebas son correctas y permanecen sin cambios)
  it("debe mostrar los enlaces de navegación principales", () => {
    render(<LandingHeader />);
    expect(
      screen.getByRole("link", { name: "Características" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Precios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
  });
  it("debe mostrar los botones de Iniciar Sesión y Registro", () => {
    render(<LandingHeader />);
    expect(
      screen.getByRole("link", { name: "Iniciar Sesión" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Regístrate Gratis" })
    ).toBeInTheDocument();
  });
});
