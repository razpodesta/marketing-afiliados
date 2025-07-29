/* Ruta: components/landing/Hero.tsx */

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * @file AnimatedGridBackground.tsx
 * @description Componente interno para renderizar un fondo de cuadrícula vectorial animado.
 * Proporciona una estética tecnológica y sutilmente dinámica.
 * @author Metashark
 */
const AnimatedGridBackground = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
    className="absolute inset-0 -z-10 overflow-hidden"
  >
    <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="hsl(var(--border)/0.5)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </motion.div>
);

/**
 * @file Hero.tsx
 * @description Sección principal de la landing page, ahora mejorada con un fondo
 * de cuadrícula vectorial animado para una mayor profundidad y una estética tecnológica.
 *
 * @author Metashark
 * @version 3.2.0 (Animated Background Integration)
 */
export function Hero() {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      <AnimatedGridBackground />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, hsl(var(--primary)/0.1), transparent 50%)",
        }}
      />

      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="container mx-auto flex flex-col items-center px-4 text-center md:px-6"
      >
        <motion.h1
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="text-4xl font-extrabold tracking-tighter text-foreground drop-shadow-md md:text-6xl"
        >
          Transforma tu Marketing de Afiliados
          <br />
          <span className="text-primary">con Inteligencia Artificial</span>
        </motion.h1>

        <motion.p
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Metashark es la suite de herramientas IA que te permite crear,
          optimizar y lanzar campañas de alta conversión en minutos, no en
          semanas.
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
            <Link href="#features">Ver Características</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
/* Ruta: components/landing/Hero.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Fondo Interactivo (Parallax):** Modificar el `AnimatedGridBackground` para que reaccione sutilmente al movimiento del ratón, creando un efecto parallax. Esto se puede lograr envolviendo el SVG en un `motion.div` y vinculando sus coordenadas `x` e `y` a los `motion values` del cursor.
 * 2. **Animación de Texto por Letra:** Para un impacto máximo en el titular, utilizar las utilidades de Framer Motion para animar la entrada de cada letra o palabra de forma escalonada, creando un efecto de "escritura" o "revelación" muy dinámico.
 * 3. **Cargar SVG Externo:** En lugar de un SVG en línea, se podría cargar un archivo SVG más complejo desde el directorio `/public`. Esto permitiría a los diseñadores crear fondos vectoriales más elaborados sin tocar el código del componente.
 * 1. **Componente Reutilizable de Animación:** Crear un componente wrapper, como `<FadeIn a... />`, que encapsule la lógica de `motion.div` y `FADE_IN_ANIMATION_VARIANTS`. Esto reduciría el código repetitivo y permitiría aplicar animaciones consistentes en toda la aplicación con una sola línea de código.
 * 2. **Animaciones Vinculadas al Scroll:** Utilizar el hook `useScroll` de Framer Motion para crear efectos más avanzados, como animar el degradado del fondo o la opacidad de los elementos a medida que el usuario se desplaza por la página, creando una experiencia más inmersiva.
 * 3. **Variantes de Animación Dinámicas:** Las variantes de animación podrían aceptar props para personalizar la dirección (ej. `y: 10` para venir desde abajo, `x: -10` para venir desde la izquierda), haciendo el componente de animación aún más flexible y reutilizable.
 * 1. **Animación de Gradiente en Texto:** Para el `span` de texto primario, se podría aplicar un fondo de gradiente animado (`background-clip: text`, `text-fill-color: transparent`) para un efecto visual aún más premium y dinámico.
 * 2. **Visual del Producto:** Justo debajo de los botones, añadir una animación de una captura de pantalla o un video corto del producto apareciendo. Esto proporciona una prueba visual inmediata del valor de la plataforma.
 * 3. **Interactividad en Hover:** Añadir animaciones `whileHover` de Framer Motion a los botones para que se escalen sutilmente o cambien de sombra al pasar el ratón, mejorando el feedback al usuario.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Animaciones de Entrada:** Aplicar animaciones sutiles de entrada (fade-in, slide-up) a los
 *    elementos del Hero (título, párrafo, botones) para una experiencia más dinámica y moderna
 *    al cargar la página.
2.  **Elemento Visual de Fondo:** Añadir un gráfico de fondo sutil o un video en bucle para
 *    hacer la sección más atractiva visualmente sin distraer del mensaje principal.
3.  **Prueba Social:** Justo debajo de los botones, añadir una pequeña sección de "prueba social"
 *    con logos de empresas que usan la plataforma o una cita de un cliente satisfecho.
*/
