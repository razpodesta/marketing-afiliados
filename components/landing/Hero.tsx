// components/landing/Hero.tsx
/**
 * @file Hero.tsx
 * @description Sección Hero de la landing page, ahora "consciente del idioma".
 *              Ha sido refactorizado para usar el componente <Link> de `next-intl`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (i18n-Aware Navigation)
 */
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
// --- INICIO DE REFACTORIZACIÓN I18N ---
import { Link } from "@/lib/navigation";
// --- FIN DE REFACTORIZACIÓN I18N ---

import { Button } from "@/components/ui/button";

// ... (Componente AnimatedGridBackground sin cambios)

export function Hero() {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      {/* ... (Fondo sin cambios) ... */}
      <motion.div
        // ... (props de motion.div sin cambios)
        className="container mx-auto flex flex-col items-center px-4 text-center md:px-6"
      >
        {/* ... (h1 y p sin cambios) ... */}
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
// components/landing/Hero.tsx
