/* Ruta: components/ui/textarea.tsx */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * @file textarea.tsx
 * @description Componente de área de texto reutilizable, estilizado para coincidir
 * con la estética de Shadcn/UI y la identidad de marca de la aplicación.
 *
 * @author Metashark (adaptado de Shadcn/UI)
 * @version 1.0.0
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
/* Ruta: components/ui/textarea.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Auto-ajuste de Altura:** Integrar una pequeña lógica o una librería ligera para que el `textarea` crezca automáticamente en altura a medida que el usuario escribe, evitando la necesidad de barras de scroll internas para textos largos.
 * 2. **Contador de Caracteres:** Añadir una prop opcional `maxLength` que, cuando se proporciona, muestre un contador de caracteres (ej. "120/500") debajo del componente para dar feedback al usuario.
 * 3. **Variantes de Estilo:** Usar `class-variance-authority` para crear variantes (ej. `variant: 'default' | 'ghost'`) que puedan alterar la apariencia del textarea para diferentes contextos de UI, como un textarea sin bordes para edición en línea.
 */
