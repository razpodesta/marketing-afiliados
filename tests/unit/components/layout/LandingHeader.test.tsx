// tests/unit/components/layout/LandingHeader.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LandingHeader,
  type LandingHeaderProps,
} from "@/components/layout/LandingHeader";
import { SmartLink } from "@/components/ui/SmartLink";

vi.mock("@/lib/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

vi.mock("@/components/ui/SmartLink", () => ({
  SmartLink: vi.fn((props: any) => (
    <a
      href={
        typeof props.href === "string" ? props.href : JSON.stringify(props.href)
      }
    >
      {props.label}
    </a>
  )),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => null,
}));
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, onOpenChange }: any) => (
    <div data-testid="sheet" data-on-open-change={onOpenChange}>
      {children}
    </div>
  ),
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetTrigger: ({ children }: any) => <button>{children}</button>,
}));

/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas para `LandingHeader`, validando su rol de orquestador
 *              y el comportamiento del menú móvil.
 * @author L.I.A Legacy
 * @version 4.1.0
 */
describe("Componente de Orquestación: LandingHeader", () => {
  const mockProps: LandingHeaderProps = {
    navLinks: [{ href: "#features", label: "Test Features" }],
    signInText: "Test Sign In",
    signUpText: "Test Sign Up",
    openMenuText: "Test Open Menu",
  };

  it("debe delegar el renderizado de los enlaces de navegación al componente SmartLink", () => {
    // Arrange
    render(<LandingHeader {...mockProps} />);
    const mockedSmartLink = vi.mocked(SmartLink);

    // Assert
    expect(mockedSmartLink).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "#features",
        label: "Test Features",
      }),
      expect.anything()
    );
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Prueba de Orquestación**: ((Implementada)) La prueba valida que el componente delega correctamente la responsabilidad de renderizar los enlaces.
 *
 * @subsection Melhorias Futuras
 * 1. **Prueba de Interacción de Menú Móvil**: ((Vigente)) Añadir una prueba que simule un clic en el enlace del menú móvil y verifique que el `Sheet` se cierra.
 */
// tests/unit/components/layout/LandingHeader.test.tsx
