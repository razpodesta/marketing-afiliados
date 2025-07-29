/**
 * @file components/ui/card.tsx
 * @description Componente de Tarjeta, ahora con reenvío de ref para compatibilidad con `asChild`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Ref Forwarding)
 */
import { cn } from "@/lib/utils";
import * as React from "react";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card"
    className={cn(
      "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn("leading-none font-semibold", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    {...props}
  />
));
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("px-6", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
/* MEJORAS FUTURAS DETECTADAS
 * 1. Variantes de Tarjeta: De manera similar al componente `Button`, se podría introducir una prop `variant` en el componente `Card` (utilizando `cva`). Esto permitiría tener diferentes estilos de tarjeta para diferentes propósitos, como una `variant="ghost"` (sin fondo ni borde) o una `variant="interactive"` (con efectos de hover más pronunciados para tarjetas clickables).
 * 2. Soporte para Media: Añadir un sub-componente `<CardMedia>` o `<CardImage>` diseñado específicamente para manejar imágenes o videos dentro de una tarjeta, asegurando que se apliquen los estilos correctos (ej. `object-fit`, radios de borde que coincidan con la tarjeta) de manera consistente.
 * 3. Prop `asChild` para Tarjetas-Enlace: Añadir la prop `asChild` al componente `Card` principal. Esto permitiría envolver una tarjeta completa en un componente `<Link>` de Next.js, haciendo que toda la tarjeta sea un único enlace navegable, lo cual es un patrón de UI muy común.
 */
