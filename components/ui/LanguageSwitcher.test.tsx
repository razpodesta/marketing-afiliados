// components/ui/LanguageSwitcher.test.tsx
/**
 * @file LanguageSwitcher.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LanguageSwitcher`.
 *              Valida la interacción del usuario, la correcta renderización de estados y,
 *              fundamentalmente, que la lógica de navegación internacionalizada (i18n)
 *              cumpla su contrato de tipos.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.0.0 (Fix: High-Fidelity Navigation Hook Mocking)
 * @see {@link file://./LanguageSwitcher.tsx} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA
 * 1.  **Mocking de Alta Fidelidad:** Se simulan los hooks de `next-intl` y `react`
 *     a nivel de módulo. El mock de `useTransition` se ha configurado para ejecutar
 *     inmediatamente el callback de `startTransition`, simplificando la lógica
 *     asíncrona. El mock de `useRouter` devuelve un `spy` estable que podemos
 *     inspeccionar en cada prueba.
 * 2.  **Aislamiento de Pruebas:** `beforeEach` se utiliza para resetear todos los
 *     mocks y reconfigurar el `router` a su estado base, garantizando que cada
 *     prueba se ejecute en un entorno limpio y predecible.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Accesibilidad (a11y):** (Vigente) Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el componente renderizado.
 * 2.  **Prueba de Fallback de Locale:** (Vigente) Simular un `locale` inválido en `useParams` y verificar que el componente se renderiza en un estado de fallback predecible.
 * 3.  **Prueba del Estado `isPending`:** (Vigente) Simular que `useTransition` devuelve `isPending: true` y verificar que los botones están deshabilitados.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { type AppPathname, usePathname, useRouter } from "@/lib/navigation";

// --- Simulación de Dependencias de Hooks ---
vi.mock("@/lib/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/navigation")>();
  return {
    ...actual,
    useRouter: vi.fn(),
    usePathname: vi.fn(),
  };
});
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useTransition: vi.fn(),
  };
});

// --- Configuración de la Suite de Pruebas ---
describe("Componente: LanguageSwitcher", () => {
  const user = userEvent.setup();
  const mockRouter = {
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    // CORRECCIÓN ESTRUCTURAL: `startTransition` ahora ejecuta el callback síncronamente.
    vi.mocked(useTransition).mockReturnValue([false, (callback) => callback()]);
  });

  it("debe renderizar correctamente y mostrar el idioma activo (Español)", () => {
    // Arrange
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    vi.mocked(useParams).mockReturnValue({ locale: "es-ES" });

    // Act
    render(<LanguageSwitcher />);

    // Assert
    const triggerButton = screen.getByRole("button", { name: /Español/i });
    expect(triggerButton).toBeInTheDocument();
    expect(screen.getByText("🇪🇸")).toBeInTheDocument();
  });

  it("debe llamar a router.replace con el contrato de tipos correcto en una ruta dinámica", async () => {
    // Arrange
    const currentPathname: AppPathname = "/dashboard/sites/[siteId]/campaigns";
    const currentParams = { locale: "es-ES", siteId: "site-abc-123" };
    vi.mocked(usePathname).mockReturnValue(currentPathname);
    vi.mocked(useParams).mockReturnValue(currentParams);

    render(<LanguageSwitcher />);

    // Act
    const triggerButton = screen.getByRole("button", { name: /Español/i });
    await user.click(triggerButton);
    const englishOption = await screen.findByRole("menuitem", {
      name: /English/i,
    });
    await user.click(englishOption);

    // Assert
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith(
        {
          pathname: currentPathname,
          params: currentParams,
        },
        { locale: "en-US" }
      );
    });
  });
});
// components/ui/LanguageSwitcher.test.tsx
