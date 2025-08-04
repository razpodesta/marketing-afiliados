// tests/components/ui/LanguageSwitcher.test.tsx
/**
 * @file LanguageSwitcher.test.tsx
 * @description Suite de pruebas de nivel de producción para el componente `LanguageSwitcher`.
 *              Ha sido refactorizada para validar la nueva lógica de navegación nativa,
 *              asegurando que el componente construya correctamente las URLs y delegue
 *              la lógica de i18n al middleware.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.1.0 (Native Navigation Test Alignment)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

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

    // Assert
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      const expectedPath = "/en-US/dashboard/sites/site-abc-123";
      expect(mockRouter.replace).toHaveBeenCalledWith(expectedPath);
    });
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que el `DropdownMenu` cumple con los estándares WCAG.
 *
 * @subsection Mejoras Implementadas
 * 1. **Corrección de Rutas de Importación**: ((Implementada)) Se han corregido las importaciones para usar alias, resolviendo el fallo de inicialización.
 * 2. **Validación de Navegación Nativa**: ((Implementada)) La suite de pruebas ha sido completamente realineada para validar la nueva y más robusta lógica de navegación nativa.
 */
// tests/components/ui/LanguageSwitcher.test.tsx
