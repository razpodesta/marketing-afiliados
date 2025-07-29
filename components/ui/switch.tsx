// components/ui/switch.tsx
"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * @file switch.tsx
 * @description Componente de interruptor (Switch) reutilizable.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de UI fundamental que encapsula la complejidad
 *  de un interruptor accesible.
 *  1.  **Base en Radix UI:** Utiliza el primitivo `Switch` de Radix, que proporciona
 *      toda la lógica de accesibilidad (roles ARIA, gestión de estado) de base.
 *  2.  **Estilizado con Tailwind:** `cn` y las clases de Tailwind se utilizan para
 *      aplicar el sistema de diseño del proyecto. Las clases `data-[state=...]`
 *      son selectores especiales que permiten estilizar el componente basándose
 *      en su estado interno (marcado/desmarcado).
 *  3.  **API Reutilizable:** Se exporta como un componente estándar de React, listo
 *      para ser utilizado en cualquier formulario que requiera una entrada booleana.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Variantes de Tamaño y Color: Utilizar `class-variance-authority` (CVA) para añadir props como `size` ('sm', 'md', 'lg') o `color` ('primary', 'destructive') y así permitir una mayor flexibilidad visual sin tener que sobrescribir clases manualmente.
 * 2. Inclusión de Etiqueta (Label): Crear un componente compuesto que combine este `Switch` con un `<Label>` para asegurar que cada interruptor tenga siempre una etiqueta de texto asociada, una práctica recomendada para la accesibilidad.
 * 3. Feedback Táctil (Haptic Feedback): En dispositivos móviles, se podría envolver el componente en un HOC (Higher-Order Component) que utilice la API de Vibración del navegador para proporcionar un sutil feedback táctil al cambiar de estado, mejorando la experiencia de usuario.
 */
