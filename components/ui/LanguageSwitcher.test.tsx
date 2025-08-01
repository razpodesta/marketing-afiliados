// Ruta: components/ui/LanguageSwitcher.test.tsx
/**
 * @file LanguageSwitcher.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LanguageSwitcher`.
 *              Esta es una red de seguridad crítica que valida la interacción del usuario,
 *              la correcta renderización de estados y, fundamentalmente, que la lógica de
 *              navegación internacionalizada (i18n) cumpla su contrato de tipos.
 *              El mock de `useRouter().replace` ha sido refinado para manejar rutas dinámicas.
 * @author RaZ Podestá & L.I.A Legacy (Refactorizado por L.I.A Legacy)
 * @version 2.2.0 (Dynamic Route Navigation Mock Fix)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Se importa el componente bajo prueba desde su ruta canónica con alias.
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
// Importar `Pathnames` para tipar correctamente la función de reemplazo mockeada.
import {
  type AppPathname,
  usePathname,
  useRouter,
  pathnames,
} from "@/lib/navigation";

// --- Simulación (Mocking) de Dependencias de Hooks ---

vi.mock("@/lib/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/navigation")>();
  return {
    ...actual, // Mantenemos exports reales como `locales`, `pathnames`
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
  // Se tipa mockRouter.replace para que espere el objeto de ruta de next-intl
  const mockRouter = {
    replace: vi.fn((route, options) => {
      // console.log("mockRouter.replace called with:", route, options);
    }),
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
    // CRÍTICO: Verificar que el argumento `route` es un objeto con `pathname` y `params`.
    // Y que el argumento `options` contiene el `locale`.
    expect(mockRouter.replace).toHaveBeenCalledWith(
      {
        pathname: currentPathname,
        params: currentParams, // Los params deben ser los de la ruta actual
      },
      { locale: "en-US" } // Y las opciones de locale deben ser el nuevo idioma
    );
  });
});

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Pruebas de Accesibilidad (a11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el componente renderizado, verificando que los atributos ARIA (`aria-label`, `role`, etc.) se utilicen correctamente en el DropdownMenu y sus ítems.
 * 2.  **Prueba de Fallback de Locale:** Simular un `locale` inválido o ausente en los parámetros de la URL y verificar que el componente se renderice en un estado de fallback predecible (ej. mostrando "Select Language" o un idioma predeterminado).
 * 3.  **Prueba del Estado `isPending`:** Simular que el hook `useTransition` devuelve `isPending: true` y verificar que el botón principal (`DropdownMenuTrigger`) y los ítems del menú estén deshabilitados para prevenir interacciones duplicadas mientras la transición de navegación está en curso.
 */
