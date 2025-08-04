// tests/app/[locale]/choose-language/page.test.tsx
/**
 * @file page.test.tsx
 * @description Arnés de pruebas para la página de selección de idioma.
 *              Refactorizada para ser una prueba de integración simple,
 *              validando que el hook `useCountdownRedirect` sea llamado.
 * @author L.I.A. Legacy
 * @version 6.0.0 (Atomic Architecture Test)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChooseLanguagePage from "@/app/[locale]/choose-language/page";
import { useCountdownRedirect } from "@/lib/hooks/useCountdownRedirect";

// Mock del nuevo hook
vi.mock("@/lib/hooks/useCountdownRedirect", () => ({
  useCountdownRedirect: vi.fn(),
}));

// Mocks de otras dependencias
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => null,
}));
vi.mock("next/image", () => ({ default: () => null }));

describe("Página: ChooseLanguagePage", () => {
  it("debe llamar al hook useCountdownRedirect y mostrar el contador", () => {
    vi.mocked(useCountdownRedirect).mockReturnValue({ countdown: 12 });

    render(<ChooseLanguagePage />);

    expect(useCountdownRedirect).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Redirigiendo al idioma por defecto en 00:12/)
    ).toBeInTheDocument();
  });
});
// tests/app/[locale]/choose-language/page.test.tsx
