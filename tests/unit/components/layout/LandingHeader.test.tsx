// tests/unit/components/layout/LandingHeader.test.tsx
/**
 * @file LandingHeader.test.tsx
 * @description Suite de pruebas final y blindada para `LandingHeader`.
 * @author L.I.A. Legacy
 * @version 6.0.0 (Warning-Free Execution)
 */
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { LandingHeader } from "@/components/layout/LandingHeader";
import messages from "@/messages/pt-BR.json";

// --- Mocks de Alta Fidelidad (Sin Advertencias) ---
vi.mock("next/image", () => ({
  default: ({
    priority, // Capturamos la prop booleana
    ...props
  }: {
    priority?: boolean;
    [key: string]: any;
  }) => (
    // La pasamos como un string al DOM si es `true`
    <img {...props} data-priority={priority ? "true" : "false"} />
  ),
}));

// El resto de mocks y la configuración se mantienen igual.
vi.mock("@/components/ui/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher-mock" />,
}));
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-menu">{children}</div>
  ),
  SheetTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (asChild ? <>{children}</> : <button>{children}</button>),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
};

describe("Componente: LandingHeader (i18n-Aware)", () => {
  it("debe usar el Link de i18n para el botón 'Iniciar Sesión' en escritorio", () => {
    renderWithProviders(<LandingHeader />);
    const loginLinks = screen.getAllByRole("link", { name: "Iniciar Sesión" });
    const desktopLoginLink = loginLinks[0];
    expect(desktopLoginLink).toHaveAttribute("href", "/pt-BR/login");
  });

  it("debe usar el Link de i18n para el botón 'Regístrate Gratis' en el menú móvil", () => {
    renderWithProviders(<LandingHeader />);
    const mobileMenu = screen.getByTestId("mobile-menu");
    const signUpLink = within(mobileMenu).getByRole("link", {
      name: "Regístrate Gratis",
    });
    expect(signUpLink).toHaveAttribute("href", "/pt-BR/login");
  });
});
