// components/landing/Features.tsx
"use client";

import { motion } from "framer-motion";
import React from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

/**
 * @file Features.tsx
 * @description Sección de características de la landing page. Refactorizado para
 *              alinearse con la arquitectura de React Server Components, recibiendo
 *              nombres de iconos como strings y renderizándolos dinámicamente.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (RSC Architecture Alignment)
 */
export interface Feature {
  /** El nombre del icono de `lucide-react` a renderizar, en formato PascalCase. */
  icon: string;
  /** El título de la característica. */
  title: string;
  /** La descripción de la característica. */
  description: string;
}

export interface FeaturesProps {
  /** El título principal de la sección. */
  title: string;
  /** El subtítulo o descripción de la sección. */
  subtitle: string;
  /** Un array de objetos de características a mostrar. */
  features: Feature[];
}

/**
 * Renderiza la sección de características de la landing page.
 * @component
 * @param {FeaturesProps} props - Las propiedades del componente.
 * @returns {React.ReactElement} El componente de sección de características.
 */
export function Features({
  title,
  subtitle,
  features,
}: FeaturesProps): React.ReactElement {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto flex flex-col items-center gap-8 px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center">{title}</h2>
        <p className="max-w-2xl text-center text-muted-foreground">
          {subtitle}
        </p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              <Card className="group h-full overflow-hidden border-border/80 bg-card/80 transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20">
                <CardHeader className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <DynamicIcon
                      name={feature.icon}
                      className="h-6 w-6 text-primary"
                    />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Alineación con Arquitectura RSC**: ((Implementada)) El contrato de props (`Feature.icon`) ahora es un `string`. El componente utiliza `DynamicIcon` para renderizar el icono en el cliente, resolviendo el error de "functions cannot be passed to client components".
 * 2. **Documentación TSDoc Verbosa**: ((Implementada)) Se ha añadido documentación TSDoc completa para el componente y sus interfaces, mejorando la mantenibilidad y claridad.
 *
 * @subsection Melhorias Futuras
 * 1. **Modal con Detalles Adicionales**: ((Vigente)) Añadir una prop `onClick` a cada `Feature` para permitir abrir un modal con más información, videos o ejemplos de la característica. Esto podría ser un objeto `action` con `href` y `type` (modal/link).
 */
// components/landing/Features.tsx
