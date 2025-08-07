// components/landing/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

/**
 * @file Hero.tsx
 * @description Sección Hero de la landing page. Refactorizado a un componente 100% puro.
 *              Todo su contenido textual, incluyendo los botones de CTA, es inyectado
 *              a través de props, garantizando una completa internacionalización.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.0.0 (Fully Internationalizable)
 */
export interface HeroProps {
  /** El titular principal que se mostrará en la sección. */
  title: string;
  /** El texto secundario o eslogan debajo del titular. */
  subtitle: string;
  /** El texto para el botón de llamada a la acción principal (ej. "Empezar Ahora"). */
  ctaPrimaryText: string;
  /** El texto para el botón de llamada a la acción secundario (ej. "Ver Características"). */
  ctaSecondaryText: string;
}

export function Hero({
  title,
  subtitle,
  ctaPrimaryText,
  ctaSecondaryText,
}: HeroProps) {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15, delayChildren: 0.5 } },
        }}
        className="container mx-auto flex flex-col items-center px-4 text-center md:px-6"
      >
        <motion.h1
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.p
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mx-auto mt-6 max-w-[700px] text-muted-foreground md:text-xl"
        >
          {subtitle}
        </motion.p>
        <motion.div
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/auth/login">
              {ctaPrimaryText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">{ctaSecondaryText}</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente 100% Puro**: ((Implementada)) Se ha extraído todo el texto estático a props, haciendo el componente completamente agnóstico al contenido y 100% internacionalizable.
 *
 * @subsection Melhorias Futuras
 * 1. **Botones de CTA Dinámicos**: ((Vigente)) Añadir una prop opcional `ctaButtons` (un array de objetos con `text`, `href` y `variant`) para permitir la total customización de los botones de Call to Action desde el componente padre.
 */
