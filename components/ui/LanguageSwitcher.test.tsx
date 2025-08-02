// components/ui/LanguageSwitcher.test.tsx
/**
 * @file LanguageSwitcher.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LanguageSwitcher`.
 *              Ha sido refactorizada para validar la nueva lógica de navegación nativa,
 *              asegurando que el componente construya correctamente las URLs y delegue
 *              la lógica de i18n al middleware.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.1.0 (Native Navigation Test Alignment)
 * @see {@link file://./LanguageSwitcher.tsx} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA ("Operación Reloj Suizo")
 * 1.  **Mocking de Hooks Nativos:** Se simulan los hooks `useRouter`, `usePathname`, y `useParams`
 *     directamente desde `next/navigation`. Esto aísla completamente al componente y nos permite
 *     controlar el entorno de la ruta para cada escenario de prueba.
 * 2.  **Validación de Construcción de URL:** La aserción clave ahora verifica que `router.replace`
 *     es llamado con la cadena de texto de la URL final, construida correctamente por el componente,
 *     incluyendo el nuevo locale y preservando el resto de la ruta.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "./LanguageSwitcher";

// --- Simulación de Dependencias de Hooks ---
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
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
describe("Componente: LanguageSwitcher (Navegación Nativa)", () => {
  const user = userEvent.setup();
  const mockRouter = {
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useTransition).mockReturnValue([false, (callback) => callback()]);
  });

  it("debe renderizar correctamente y mostrar el idioma activo (Português)", () => {
    // Arrange
    vi.mocked(usePathname).mockReturnValue("/pt-BR/dashboard");
    vi.mocked(useParams).mockReturnValue({ locale: "pt-BR" });

    // Act
    render(<LanguageSwitcher />);

    // Assert
    const triggerButton = screen.getByRole("button", { name: /Português/i });
    expect(triggerButton).toBeInTheDocument();
    expect(screen.getByText("🇧🇷")).toBeInTheDocument();
  });

  it("debe llamar a router.replace con la URL correctamente construida al cambiar de idioma", async () => {
    // Arrange
    const currentPathname = "/es-ES/dashboard/sites/site-abc-123";
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

    // Assert: La prueba ahora valida que el componente construye la URL de string
    // correcta para la navegación nativa.
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      const expectedPath = "/en-US/dashboard/sites/site-abc-123";
      expect(mockRouter.replace).toHaveBeenCalledWith(expectedPath);
    });
  });
});
// components/ui/LanguageSwitcher.test.tsx
