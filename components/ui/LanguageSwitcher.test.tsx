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

// Se importa el componente bajo prueba desde su ruta canónica con alias.
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
 *               `LanguageSwitcher`, garantizando la integridad de la navegación
 *               internacionalizada.
 *
 * @functionality
 * - **Aislamiento a través de Mocking de Alta Fidelidad:** Se utiliza `vi.mock` para reemplazar
 *   todas las dependencias externas de hooks (`useRouter`, `usePathname`, `useParams`). Esto
 *   aísla completamente al componente, permitiendo probar su lógica interna de forma
 *   determinista.
 * - **Prueba del Contrato de Tipos (Crítica):** La prueba más importante simula que el usuario
 *   se encuentra en una ruta dinámica y cambia el idioma. Luego, se afirma que la función
 *   `router.replace` es llamada con la estructura de objeto exacta que `next-intl` requiere.
 *   Esto valida que nuestro componente cumple con el contrato de tipos de la librería de
 *   navegación, previniendo errores en tiempo de ejecución.
 * - **Validación de Renderizado:** La primera prueba asegura que el componente se renderiza
 *   correctamente y muestra el idioma activo basado en los parámetros de la URL simulados.
 *
 * @relationships
 * - Valida el componente `components/ui/LanguageSwitcher.tsx`.
 * - Depende de la correcta configuración de mocks para los hooks de `next/navigation` y
 *   `lib/navigation.ts`.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce cualquier cambio en `LanguageSwitcher.tsx`
 *   que altere su renderizado, su lógica de estado o, más críticamente, la forma en que
 *   invoca la API de enrutamiento de `next-intl`. Actúa como un guardián automatizado
 *   para una de las funcionalidades de UX más importantes.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Accesibilidad (a11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el componente renderizado, verificando que los atributos ARIA (`aria-label`, `role`, etc.) se utilicen correctamente.
 * 2.  **Prueba de Fallback de Locale:** Simular un `locale` inválido o ausente en los parámetros de la URL y verificar que el componente se renderice en un estado de fallback predecible (ej. mostrando "Select Language").
 * 3.  **Prueba del Estado `isPending`:** Simular que el hook `useTransition` devuelve `isPending: true` y verificar que el botón principal y los ítems del menú estén deshabilitados para prevenir interacciones duplicadas.
 */
