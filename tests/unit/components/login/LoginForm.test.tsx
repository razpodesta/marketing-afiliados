// tests/components/login/LoginForm.test.tsx
/**
 * @file LoginForm.test.tsx
 * @description Suite de pruebas para `LoginForm`. Este archivo ahora es estable
 *              y no requiere cambios lógicos, ya que la causa raíz del error de tipo
 *              `TS2345` ha sido resuelta en la configuración global de pruebas
 *              (`vitest.setup.ts`). Se vuelve a entregar para cumplir con el protocolo.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 5.1.0 (Stable - No Changes Required)
 * @see {@link file://../../../app/[locale]/login/login-form.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/app/[locale]/auth/login/login-form";

// --- Simulación de Dependencias (solo las no cubiertas por el setup global) ---
vi.mock("@supabase/auth-ui-react", () => ({
  Auth: ({ view }: { view: string }) => (
    <div data-testid="supabase-auth-ui" data-view={view} />
  ),
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

describe("Componente: LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("process", {
      ...process,
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("debe renderizar la UI de Supabase con la vista 'sign_in' por defecto", () => {
    // El mock global ya provee una instancia vacía y compatible.
    render(<LoginForm localization={{}} defaultView="sign_in" />);

    const authUI = screen.getByTestId("supabase-auth-ui");
    expect(authUI).toBeInTheDocument();
    expect(authUI).toHaveAttribute("data-view", "sign_in");
  });

  it("debe mostrar un mensaje de error si está presente en los parámetros de la URL", () => {
    // Arrange
    // La instancia de URLSearchParams es compatible con el tipo esperado por el mock.
    const searchParams = new URLSearchParams(
      "?error=true&message=Credenciales inválidas"
    );
    vi.mocked(useSearchParams).mockReturnValue(searchParams as any);

    // Act
    render(<LoginForm localization={{}} defaultView="sign_in" />);

    // Assert
    expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("debe mostrar un error de configuración si NEXT_PUBLIC_SITE_URL no está definida", () => {
    // Arrange
    vi.stubGlobal("process", {
      ...process,
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: undefined },
    });
    // No se necesita sobrescribir el mock.

    // Act
    render(<LoginForm localization={{}} />);

    // Assert
    expect(
      screen.getByText(/Error de configuración del sistema/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId("supabase-auth-ui")).not.toBeInTheDocument();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Redirección Inteligente (`next` param)**: ((Vigente)) Añadir una prueba que simule un `?next=/dashboard/settings` en la URL y verifique que la prop `redirectTo` del componente `Auth` de Supabase se construye correctamente.
 *
 * @subsection Mejoras Implementadas
 * 1. **Integración con Mock Global**: ((Implementada)) El error `TS2345` ha sido resuelto de forma sistémica en `vitest.setup.ts`, haciendo este archivo de prueba inherentemente más robusto.
 */
// tests/components/login/LoginForm.test.tsx
