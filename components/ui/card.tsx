import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
/* MEJORAS FUTURAS DETECTADAS
 * 1. Variantes de Tarjeta: De manera similar al componente `Button`, se podría introducir una prop `variant` en el componente `Card` (utilizando `cva`). Esto permitiría tener diferentes estilos de tarjeta para diferentes propósitos, como una `variant="ghost"` (sin fondo ni borde) o una `variant="interactive"` (con efectos de hover más pronunciados para tarjetas clickables).
 * 2. Soporte para Media: Añadir un sub-componente `<CardMedia>` o `<CardImage>` diseñado específicamente para manejar imágenes o videos dentro de una tarjeta, asegurando que se apliquen los estilos correctos (ej. `object-fit`, radios de borde que coincidan con la tarjeta) de manera consistente.
 * 3. Prop `asChild` para Tarjetas-Enlace: Añadir la prop `asChild` al componente `Card` principal. Esto permitiría envolver una tarjeta completa en un componente `<Link>` de Next.js, haciendo que toda la tarjeta sea un único enlace navegable, lo cual es un patrón de UI muy común.
 */
