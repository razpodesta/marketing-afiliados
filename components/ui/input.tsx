import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
/* MEJORAS FUTURAS DETECTADAS
 * 1. Input con Iconos: Crear un componente de nivel superior, como `<InputWithIcon>`, que componga este componente `<Input>` y permita añadir fácilmente un icono (`lucide-react`) a la izquierda o a la derecha del campo de texto. Este es un patrón de UI muy común para campos de búsqueda, email o contraseña.
 * 2. Variantes de Tamaño y Estilo: Al igual que el componente `<Button>`, se podría integrar `cva` para añadir props de `size` (`sm`, `md`, `lg`) y `variant` (`default`, `ghost`). Esto permitiría una mayor flexibilidad de diseño sin necesidad de sobrescribir clases manualmente.
 * 3. Integración con `<Label>` y Mensajes de Error: Crear un componente `<FormField>` que agrupe `<Label>`, `<Input>` y un espacio para mostrar mensajes de validación de error. Esto abstraería el patrón de campo de formulario completo, reduciendo el código repetitivo en los formularios y asegurando la correcta asociación de etiquetas e inputs para la accesibilidad.
 */