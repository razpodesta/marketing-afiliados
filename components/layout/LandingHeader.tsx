// components/layout/LandingHeader.tsx
/**
 * @file LandingHeader.tsx
 * @description Encabezado principal de la landing page pública. Ha sido refactorizado
 *              para corregir un anidamiento de DOM inválido (`<button>` dentro de `<button>`),
 *              resolviendo la advertencia `validateDOMNesting` y garantizando un HTML semántico
 *              y accesible.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.1.0 (DOM Nesting Fix)
 * @see {@link file://../../../tests/components/layout/LandingHeader.test.tsx} Para el arnés de pruebas correspondiente.
 */
"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
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
                {/* --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA --- */}
                {/* La prop `asChild` se pasa al Button, no al Trigger. */}
                {/* Button ahora renderizará el elemento que SheetTrigger espera. */}
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
                {/* --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA --- */}
              </SheetTrigger>
              <SheetContent side="right">
                <nav
                  aria-label="Navegación Móvil"
                  className="grid gap-6 text-lg font-medium mt-8"
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
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

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Animación al Hacer Scroll:** ((Vigente)) Implementar una animación que reduzca sutilmente la altura del header cuando el usuario hace scroll.
 * 2. **Estado de Autenticación Dinámico:** ((Vigente)) Este componente debería recibir la sesión del usuario como prop. Si el usuario está autenticado, los botones de login se reemplazarían por un menú de avatar.
 * 3. **Resaltado de Sección Activa:** ((Vigente)) Utilizar un "Intersection Observer" para detectar qué sección está en el viewport y aplicar un estilo "activo" al enlace de navegación correspondiente.
 *
 * @subsection Mejoras Implementadas
 * 1. **Anidamiento de DOM Corregido**: ((Implementada)) Se ha corregido la composición de `SheetTrigger` y `Button`, eliminando la advertencia `validateDOMNesting` y asegurando un HTML semántico y válido.
 */
// components/layout/LandingHeader.tsx
