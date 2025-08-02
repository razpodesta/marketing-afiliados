// app/[locale]/choose-language/page.test.tsx
/**
 * @file page.test.tsx
 * @description Arnés de pruebas de producción para la página de selección de idioma.
 *              Valida el renderizado, la lógica del temporizador de 15 segundos
 *              y las interacciones del usuario para la selección y cambio de idioma.
 * @author L.I.A Legacy
 * @version 1.0.0
 * @see {@link file://./page.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ChooseLanguagePage from "./page";

// --- Simulación de Dependencias ---
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("js-cookie", () => ({
  default: {
    set: vi.fn(),
  },
}));
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher-mock" />,
}));
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

describe("Componente: ChooseLanguagePage", () => {
  const user = userEvent.setup();
  const mockRouter = { replace: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debe renderizar los elementos principales y el nuevo LanguageSwitcher", () => {
    // Arrange
    render(<ChooseLanguagePage />);

    // Assert
    expect(screen.getByText("Please Select Your Language")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Español/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("language-switcher-mock")).toBeInTheDocument();
    expect(screen.getByText(/Redirigiendo.*00:15/)).toBeInTheDocument();
  });

  it("debe llamar a la redirección con el idioma por defecto (es-ES) después de 15 segundos", async () => {
    // Arrange
    render(<ChooseLanguagePage />);

    // Act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });

    // Assert
    expect(Cookies.set).toHaveBeenCalledWith("NEXT_LOCALE_CHOSEN", "es-ES", {
      expires: 365,
      path: "/",
    });
    expect(mockRouter.replace).toHaveBeenCalledWith("/es-ES");
  });

  it("debe llamar a la redirección con el idioma seleccionado al hacer clic en un botón", async () => {
    // Arrange
    render(<ChooseLanguagePage />);
    const portuguesButton = screen.getByRole("button", { name: /Português/i });

    // Act
    await user.click(portuguesButton);

    // Assert
    expect(Cookies.set).toHaveBeenCalledWith("NEXT_LOCALE_CHOSEN", "pt-BR", {
      expires: 365,
      path: "/",
    });
    expect(mockRouter.replace).toHaveBeenCalledWith("/pt-BR");
  });
});
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Prueba de Limpieza del Temporizador**: (Vigente) Añadir una prueba que verifique que el temporizador de `setTimeout` se limpia correctamente cuando el componente se desmonta. Esto se puede lograr usando el método `unmount` de `render` y espiando `clearTimeout`.
 * 2. **Prueba de Accesibilidad (a11y)**: (Vigente) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que la página cumple con los estándares WCAG, especialmente en lo que respecta a los botones y la información de la cuenta regresiva.
 */
// app/[locale]/choose-language/page.test.tsx
