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
