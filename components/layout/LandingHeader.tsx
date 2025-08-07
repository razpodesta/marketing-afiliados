// components/layout/LandingHeader.tsx
"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SmartLink, type NavLinkItem } from "@/components/ui/SmartLink";
import { Link, type AppPathname } from "@/lib/navigation";

/**
 * @file LandingHeader.tsx
 * @description Encabezado de la landing page, refactorizado para consumir el
 *              componente atómico `SmartLink` y manejar correctamente los eventos
 *              de UI en el menú móvil.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 12.1.0
 * @see {@link file://./tests/unit/components/layout/LandingHeader.test.tsx} Para el arnés de pruebas correspondiente.
 */
export interface LandingHeaderProps {
  navLinks: NavLinkItem[];
  signInText: string;
  signUpText: string;
  openMenuText: string;
}

export function LandingHeader({
  navLinks,
  signInText,
  signUpText,
  openMenuText,
}: LandingHeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const rootPath: AppPathname = "/";
  const loginPath: AppPathname = "/auth/login";
  const signupPath: AppPathname = "/auth/signup";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={rootPath} className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Logo de MetaShark"
            width={40}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
          <span className="text-xl font-bold text-foreground">Metashark</span>
        </Link>

        <nav
          aria-label="Navegación Principal"
          className="hidden items-center gap-6 text-sm font-medium md:flex"
        >
          {navLinks.map((link) => (
            <SmartLink
              key={
                typeof link.href === "string" ? link.href : link.href.pathname
              }
              {...link}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href={loginPath}>{signInText}</Link>
            </Button>
            <Button asChild>
              <Link href={signupPath}>{signUpText}</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{openMenuText}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav
                  aria-label="Navegación Móvil"
                  className="grid gap-6 text-lg font-medium mt-8"
                >
                  {navLinks.map((link) => (
                    <div
                      key={
                        typeof link.href === "string"
                          ? link.href
                          : link.href.pathname
                      }
                      onClick={() => setIsSheetOpen(false)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        setIsSheetOpen(false)
                      }
                    >
                      <SmartLink {...link} />
                    </div>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t border-border/40 flex flex-col gap-4">
                  <LanguageSwitcher />
                  <Button variant="ghost" asChild>
                    <Link href={loginPath}>{signInText}</Link>
                  </Button>
                  <Button asChild>
                    <Link href={signupPath}>{signUpText}</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Composición de Componentes Correcta**: ((Implementada)) Se ha envuelto `SmartLink` en un `div` con el manejador `onClick` en el menú móvil, resolviendo el error `TS2322` y respetando el contrato de `SmartLink`.
 * 2. **Accesibilidad (a11y)**: ((Implementada)) Se han añadido los atributos `role`, `tabIndex` y `onKeyDown` al `div` interactivo para asegurar que sea accesible a través del teclado.
 */
// components/layout/LandingHeader.tsx
