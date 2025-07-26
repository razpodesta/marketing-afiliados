/* Ruta: components/landing/Header.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Image from "next/image";
import Link from "next/link";

/**
 * @file Header.tsx
 * @description Encabezado principal de la landing page, rediseñado con la nueva
 * identidad de marca. Es fijo en la parte superior, con un efecto de desenfoque
 * de fondo para una estética moderna.
 *
 * @author Metashark
 * @version 4.0.0 (Brand Identity Redesign)
 */
export function LandingHeader() {
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

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="#features"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Características
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Precios
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Regístrate Gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
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
