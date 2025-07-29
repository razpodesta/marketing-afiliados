// components/layout/LandingHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/**
 * @file LandingHeader.tsx
 * @description Encabezado principal de la landing page pública.
 *              Se ha corregido el nombre de la exportación para alinearlo con el
 *              nombre del archivo y las convenciones del proyecto.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Canonical Renaming)
 */
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

        {/* Navegación para Escritorio */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
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

          {/* Menú para Móviles */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium mt-8">
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Animación al Hacer Scroll: Implementar una animación que reduzca sutilmente la altura (padding) del header y el tamaño del logo cuando el usuario comienza a hacer scroll hacia abajo. Esto maximiza el espacio visible para el contenido y añade un toque de refinamiento a la interfaz.
 * 2. Estado de Autenticación Dinámico: Este componente debería recibir la sesión del usuario como prop desde el componente de servidor de la página. Si el usuario está autenticado, los botones "Iniciar Sesión" y "Regístrate" se reemplazarían por un menú de avatar con un enlace al "Dashboard" y "Cerrar Sesión", creando una experiencia coherente.
 * 3. Resaltado de Sección Activa: Utilizar un "Intersection Observer" para detectar qué sección de la landing page (`#features`, `#pricing`) está actualmente en el viewport y aplicar un estilo "activo" al enlace de navegación correspondiente en el header, proporcionando un mejor feedback de la ubicación del usuario en la página.
 */
/* Ruta: components/landing/Header.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Header Adaptativo con `<Sheet>`:** En vistas móviles, los enlaces de navegación ("Características", "Precios") deberían colapsarse en un menú de hamburguesa que abra un componente `<Sheet>` de Shadcn/UI para una experiencia móvil óptima.
 * 2. **Animación al Hacer Scroll:** Implementar una animación que reduzca sutilmente la altura (padding) del header y el tamaño del logo cuando el usuario comienza a hacer scroll hacia abajo. Esto maximiza el espacio visible para el contenido.
 * 3. **Estado de Autenticación Dinámico:** En un próximo paso, este componente debería recibir la sesión del usuario como prop. Si el usuario está autenticado, los botones "Iniciar Sesión" y "Regístrate" se reemplazarían por un menú de avatar con un enlace al "Dashboard" y "Cerrar Sesión".
dimiento superior, convierte el `logo-metashark-256x256-png.png` a formato `.webp` usando una herramienta como Squoosh.app. Los archivos WebP son significativamente más pequeños con una calidad visual similar, lo que acelera los tiempos de carga.
2.  **Header Adaptativo (Responsive):** Para pantallas pequeñas, los enlaces de navegación deberían colapsarse en un menú de hamburguesa (`<Sheet>` de Shadcn/UI) para mantener una interfaz limpia.
3.  **Estado de Autenticación Dinámico:** El header debería detectar si el usuario está autenticado y cambiar los botones de "Iniciar Sesión"/"Regístrate" por un enlace al "Dashboard" y un menú de perfil de usuario.
4.  **Logo SVG:** Para una calidad de imagen perfecta en todas las resoluciones (incluyendo pantallas retina) y un tamaño de archivo a menudo menor, la mejor práctica es usar una versión SVG del logo. El componente `next/image` también soporta y optimiza SVGs.

1.  **Header Adaptativo:** Para pantallas pequeñas, los enlaces de navegación (`Características`, etc.)
 *    deberían colapsarse en un menú de hamburguesa (`<Sheet>` de Shadcn/UI) para evitar
 *    desbordamientos y mantener una interfaz limpia.
2.  **Estado de Autenticación:** El header debería ser consciente de si el usuario ya está
 *    autenticado. Si es así, los botones "Iniciar Sesión" y "Regístrate" deberían ser
 *    reemplazados por un enlace al "Dashboard" y un menú de perfil.
3.  **Precarga de Fuentes (Font Preloading):** Para mejorar aún más el LCP (Largest Contentful Paint), se puede
 *    precargar el archivo de fuente principal en el `layout.tsx` raíz.
4.  **SVG Logo:** Para una calidad de imagen perfecta en cualquier resolución y un tamaño de archivo
 *    potencialmente menor, considera usar una versión SVG de tu logo en lugar de un formato rasterizado
 *    como WebP o PNG. El componente `next/image` también soporta SVGs.
1.  **Header Adaptativo:** Para pantallas pequeñas, los enlaces de navegación (`Características`, etc.)
 *    deberían colapsarse en un menú de hamburguesa (`<Sheet>` de Shadcn/UI) para evitar
 *    desbordamientos y mantener una interfaz limpia.
2.  **Estado de Autenticación:** El header debería ser consciente de si el usuario ya está
 *    autenticado. Si es así, los botones "Iniciar Sesión" y "Regístrate" deberían ser
 *    reemplazados por un enlace al "Dashboard" y un menú de perfil.
*/
