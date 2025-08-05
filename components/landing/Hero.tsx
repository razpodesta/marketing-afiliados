// components/landing/Hero.tsx
/**
 * @file Hero.tsx
 * @description Sección Hero de la landing page. Ha sido refactorizado para ser un
 *              componente de presentación puro, recibiendo su contenido a través
 *              de props para facilitar la internacionalización y reutilización.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Content Decoupling)
 */
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

/**
 * @interface HeroProps
 * @description Define las propiedades que el componente Hero acepta.
 * @property {string} title - El titular principal que se mostrará.
 * @property {string} subtitle - El texto secundario o eslogan.
 */
export interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
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
            <Link href="/login">
              Empezar Ahora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Ver Características</a>
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
 * 1. **Desacoplamiento de Contenido**: ((Implementada)) El componente ahora es de presentación pura, recibiendo su texto vía props. Esto es fundamental para la internacionalización y resuelve la causa raíz del bug.
 * 2. **Contrato de Props Explícito**: ((Implementada)) Se ha añadido la interfaz `HeroProps` para un tipado estricto.
 *
 * @subsection Melhorias Futuras
 * 1. **Botones de CTA Dinámicos**: ((Vigente)) Añadir una prop opcional `ctaButtons` (un array de objetos con `text`, `href` y `variant`) para permitir la total customización de los botones de Call to Action desde el componente padre.
 * 2. **Imagen de Fondo/Video**: ((Vigente)) Añadir una prop `backgroundUrl` que pueda aceptar una URL de imagen o video para mostrar en el fondo de la sección, haciéndola más versátil.
 */
