// Ruta: components/ui/LanguageSwitcher.test.tsx
/**
 * @file LanguageSwitcher.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LanguageSwitcher`.
 *              Esta es una red de seguridad crítica que valida la interacción del usuario,
 *              la correcta renderización de estados y, fundamentalmente, que la lógica de
 *              navegación internacionalizada (i18n) cumpla su contrato de tipos.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.1.0 (Corrected Imports & Strict Type Mocking)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// CORRECCIÓN: Se importa el componente bajo prueba desde su ruta canónica con alias.
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { type AppPathname, usePathname, useRouter } from "@/lib/navigation";

// --- Simulación (Mocking) de Dependencias de Hooks ---

vi.mock("@/lib/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/navigation")>();
  return {
    ...actual, // Mantenemos exports reales como `locales`
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
  let mockIsPending = false;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useTransition).mockReturnValue([mockIsPending, vi.fn()]);
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
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: currentPathname,
        params: currentParams as any,
      },
      { locale: "en-US" }
    );
  });
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview Esta suite de pruebas actúa como un "contrato de comportamiento" para el
 *               `LanguageSwitcher`.
 *
 * @functionality
 * - **Aislamiento a través de Mocking:** Se utiliza `vi.mock` para reemplazar todas las
 *   dependencias externas.
 * - **Prueba del Contrato de Tipos:** La prueba más crítica ahora simula que `usePathname`
 *   devuelve un `AppPathname` válido, replicando el entorno de tipos estricto y
 *   verificando que la llamada a `router.replace` cumple con el contrato.
 * - **Corrección de Importación:** El error de "módulo no encontrado" se resuelve
 *   importando `LanguageSwitcher` desde su ruta canónica con alias.
 *
 * @relationships
 * - Valida el componente `components/ui/LanguageSwitcher.tsx`.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce cualquier cambio en `LanguageSwitcher.tsx`
 *   que altere su renderizado o la forma en que invoca la API de enrutamiento.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Accesibilidad (A11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad.
 * 2.  **Prueba de Fallback de Locale:** Simular un `locale` inválido y verificar que el componente se renderice en un estado de fallback predecible.
 */
// Ruta: components/ui/LanguageSwitcher.test.tsx
