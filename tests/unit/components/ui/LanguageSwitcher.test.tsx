// tests/unit/components/ui/LanguageSwitcher.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { usePathname, useRouter } from "@/lib/navigation";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `i18n_${key}`,
}));
vi.mock("@/lib/navigation", () => ({
  locales: ["en-US", "es-ES", "pt-BR"],
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));
vi.mock("js-cookie", () => ({
  default: {
    set: vi.fn(),
  },
}));
vi.mock("@/lib/logging", () => ({
  logger: {
    trace: vi.fn(),
  },
}));

/**
 * @file LanguageSwitcher.test.tsx
 * @description Arnés de pruebas unitarias para el componente `LanguageSwitcher`.
 * @author L.I.A. Legacy
 * @version 1.1.0
 */
describe("Arnés de Pruebas: LanguageSwitcher", () => {
  const user = userEvent.setup();
  const mockRouterReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: mockRouterReplace } as any);
    vi.mocked(usePathname).mockReturnValue("/dashboard"); // Un AppPathname válido
  });

  it("debe renderizar el idioma activo actual correctamente", () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ locale: "es-ES" });

    // Act
    render(<LanguageSwitcher />);

    // Assert
    const triggerButton = screen.getByRole("button", {
      name: "i18n_selectLanguage_sr",
    });
    expect(triggerButton).toHaveTextContent("i18n_language_es_ES");
  });

  it("debe llamar a Cookies.set y router.replace al seleccionar un nuevo idioma", async () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ locale: "es-ES" });
    render(<LanguageSwitcher />);
    const triggerButton = screen.getByRole("button", {
      name: "i18n_selectLanguage_sr",
    });

    // Act
    await user.click(triggerButton);
    const englishOption = await screen.findByRole("menuitem", {
      name: /i18n_language_en_US/,
    });
    await user.click(englishOption);

    // Assert
    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith("NEXT_LOCALE_CHOSEN", "en-US", {
        expires: 365,
        path: "/",
      });
      expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard", {
        locale: "en-US",
      });
    });
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Infraestructura de Mocks**: ((Implementada)) Se ha corregido la simulación de `useParams` (TS2305) y `usePathname` (TS2345) para que provean los tipos y valores correctos, estabilizando la suite de pruebas.
 *
 * @subsection Melhorias Futuras
 * 1. **Pruebas de Accesibilidad (a11y)**: ((Vigente)) Integrar `jest-axe` para analizar el HTML renderizado.
 */
// tests/unit/components/ui/LanguageSwitcher.test.tsx
