/* Ruta: components/ui/ThemeSwitcher.tsx */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @file ThemeSwitcher.tsx
 * @description Componente de cliente que permite al usuario cambiar entre
 * los temas claro, oscuro y el predeterminado del sistema.
 * LÓGICA DE RENDERIZADO: Utiliza un patrón de renderizado inteligente donde ambos
 * iconos (sol y luna) están siempre en el DOM, y las clases de utilidad de Tailwind
 * para el modo oscuro (`dark:...`) se encargan de mostrar/ocultar el icono correcto
 * basándose en la clase `dark` del elemento `<html>`.
 *
 * @author Metashark
 * @version 1.0.0
 */
export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* Ruta: components/ui/ThemeSwitcher.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Indicador de Tema Activo:** Añadir un indicador visual (como un icono de `Check` o un fondo resaltado) en el `DropdownMenuItem` que corresponda al tema actualmente activo, mejorando el feedback al usuario.
 * 2. **Atajos de Teclado:** Integrar un atajo de teclado (ej. `T`) que abra el menú del `ThemeSwitcher` o que alterne directamente entre los temas claro y oscuro para una accesibilidad y productividad mejoradas.
 * 3. **Sincronización entre Pestañas:** `next-themes` soporta la sincronización del tema entre diferentes pestañas del navegador. Asegurarse de que esta funcionalidad esté habilitada por defecto puede mejorar la consistencia de la experiencia del usuario si trabajan con múltiples instancias de la aplicación abiertas.
 */
