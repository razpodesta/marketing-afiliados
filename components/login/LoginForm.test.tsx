/**
 * @file components/login/LoginForm.test.tsx
 * @description Pruebas unitarias para el componente `LoginForm`.
 * @author L.I.A Legacy
 * @version 2.0.0 (Robust Mocking)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/app/[locale]/login/login-form";

vi.mock("@supabase/auth-ui-react", () => ({
  Auth: ({ view }: { view: string }) => (
    <div data-testid="supabase-auth-ui" data-view={view}>
      Supabase Auth UI
    </div>
  ),
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

describe("Componente: LoginForm", () => {
  // CORRECCIÓN: Se redefine el mock para cada prueba para evitar interferencias.
  it("debe renderizar el componente Auth de Supabase con la vista de sign_in por defecto", () => {
    vi.mock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams(),
    }));
    render(<LoginForm localization={{}} defaultView="sign_in" />);
    const authUI = screen.getByTestId("supabase-auth-ui");
    expect(authUI).toBeInTheDocument();
    expect(authUI).toHaveAttribute("data-view", "sign_in");
  });

  it("debe mostrar un mensaje de error si está presente en los parámetros de la URL", () => {
    vi.mock("next/navigation", () => ({
      useSearchParams: () =>
        new URLSearchParams("?error=true&message=Credenciales inválidas"),
    }));
    render(<LoginForm localization={{}} defaultView="sign_in" />);
    // El componente ahora renderiza la alerta de error en lugar de la UI de Supabase,
    // por lo que la aserción debe buscar el texto del error.
    expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
  });
});
