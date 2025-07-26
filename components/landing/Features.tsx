/* Ruta: components/landing/Features.tsx */

"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Bot, LayoutTemplate, PenSquare, PieChart } from "lucide-react";
import React from "react";

/**
 * @file Features.tsx
 * @description Sección de características principales de la landing page. Muestra los
 * servicios clave de la plataforma en tarjetas interactivas y animadas que responden
 * al cursor del usuario para una experiencia atractiva y moderna.
 *
 * @author Metashark
 * @version 1.0.0
 */

const features = [
  {
    icon: LayoutTemplate,
    title: "Constructor de Landings IA",
    description:
      "Crea páginas de venta y captura de alta conversión en minutos con nuestro constructor guiado por IA.",
  },
  {
    icon: PenSquare,
    title: "AI Copywriter Pro",
    description:
      "Genera textos persuasivos para tus anuncios, emails y landings que conectan con tu audiencia y venden.",
  },
  {
    icon: PieChart,
    title: "Análisis Predictivo",
    description:
      "Nuestra IA analiza tus métricas y te da insights claros para optimizar tus campañas y maximizar tu ROI.",
  },
  {
    icon: Bot,
    title: "Asistente L.I.A",
    description:
      "Tu estratega de marketing personal. Resuelve dudas, genera ideas y audita tus estrategias 24/7.",
  },
];

export function Features() {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto flex flex-col items-center gap-8 px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center">
          Una Suite de Herramientas, Potencial Ilimitado
        </h2>
        <p className="max-w-2xl text-center text-muted-foreground">
          Todo lo que necesitas para escalar tus operaciones de afiliado,
          impulsado por la tecnología más avanzada.
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
                    <feature.icon className="h-6 w-6 text-primary" />
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
/* Ruta: components/landing/Features.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Efecto de Borde Iluminado (`Spotlight`):** Implementar un efecto "spotlight" en el hover de las tarjetas, donde un gradiente cónico sigue al cursor dentro de los límites de la tarjeta, creando un efecto de iluminación muy sofisticado.
 * 2. **Contenido Dinámico desde CMS:** Mover el array `features` a un sistema de gestión de contenidos (CMS) como Contentful o incluso a una tabla en Supabase. Esto permitiría al equipo de marketing actualizar las características sin necesidad de un despliegue de código.
 * 3. **Modal con Más Detalles:** Al hacer clic en una tarjeta, se podría abrir un modal (`Dialog` de Shadcn) que muestre más detalles sobre la característica, incluyendo un video corto de demostración o una lista de sub-funcionalidades.
 */
