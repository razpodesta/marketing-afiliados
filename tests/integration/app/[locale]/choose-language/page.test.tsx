// tests/integration/app/[locale]/choose-language/page.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChooseLanguagePage from "@/app/[locale]/choose-language/page";
import { ChooseLanguageClient } from "@/app/[locale]/choose-language/choose-language-client";

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
  unstable_setRequestLocale: vi.fn(),
}));

vi.mock("@/app/[locale]/choose-language/choose-language-client", () => ({
  ChooseLanguageClient: vi.fn(() => null),
}));

/**
 * @file page.test.tsx
 * @description Arnés de pruebas para la página de selección de idioma. Valida
 *              que el orquestador de servidor obtenga las traducciones y las
 *              pase correctamente como props al componente cliente.
 * @author L.I.A. Legacy
 * @version 7.0.0
 */
describe("Página de Orquestación: ChooseLanguagePage", () => {
  it("debe obtener las traducciones y pasarlas como props a ChooseLanguageClient", async () => {
    // Act
    const PageComponent = await ChooseLanguagePage({
      params: { locale: "en-US" },
    });
    render(PageComponent);

    // Assert
    expect(ChooseLanguageClient).toHaveBeenCalledTimes(1);
    expect(vi.mocked(ChooseLanguageClient).mock.calls[0][0]).toEqual({
      title: "ChooseLanguagePage.title",
      selectFromListText: "ChooseLanguagePage.selectFromListText",
      redirectText: "ChooseLanguagePage.redirectText",
    });
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Prueba de Orquestación**: ((Implementada)) La prueba ahora valida el contrato de datos entre el componente de servidor y el de cliente, asegurando que la internacionalización está correctamente cableada.
 */
// tests/integration/app/[locale]/choose-language/page.test.tsx
