// components/layout/LandingHeader.tsx
/**
 * @file LandingHeader.tsx
 * @description Encabezado de la landing page, ahora "consciente del idioma".
 *              Ha sido refactorizado para usar el componente <Link> de `next-intl`,
 *              asegurando que todos los enlaces de navegación incluyan el prefijo
 *              del `locale` actual.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.0.0 (i18n-Aware Navigation)
 */
"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
// --- INICIO DE REFACTORIZACIÓN I18N ---
import { Link } from "@/lib/navigation";
// --- FIN DE REFACTORIZACIÓN I18N ---
import * as React from "react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LandingHeader() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const navLinks = [
    { href: "#features", label: "Características" },
    { href: "#pricing", label: "Precios" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
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
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Regístrate Gratis</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav
                  aria-label="Navegación Móvil"
                  className="grid gap-6 text-lg font-medium mt-8"
                >
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t border-border/40 flex flex-col gap-4">
                  <LanguageSwitcher />
                  <Button variant="ghost" asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/login">Regístrate Gratis</Link>
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
// components/layout/LandingHeader.tsx
