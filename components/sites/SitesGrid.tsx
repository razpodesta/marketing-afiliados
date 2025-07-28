/**
 * @file SitesGrid.tsx
 * @description Componente responsable de renderizar la cuadrícula de sitios
 *              o un estado vacío si no existen sitios.
 * @refactor
 * REFACTORIZACIÓN 360:
 * 1. Corregido el error de tipo 'never' añadiendo una anotación de tipo explícita
 *    en el método `.map()`.
 * 2. Implementada la animación de layout con `framer-motion` para una experiencia
 *    de usuario más fluida al filtrar o eliminar sitios.
 *
 * @author Metashark
 * @version 2.0.0 (Type Fix & Layout Animations)
 */
"use client";

import { Card } from "@/components/ui/card";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import { AnimatePresence, motion } from "framer-motion";
import { SiteCard } from "./SiteCard";

interface SitesGridProps {
  sites: SiteWithCampaignsCount[];
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  deletingSiteId: string | null;
}

export function SitesGrid({
  sites,
  onDelete,
  isPending,
  deletingSiteId,
}: SitesGridProps) {
  if (sites.length === 0) {
    return (
      <Card className="flex h-64 flex-col items-center justify-center p-8 text-center border-dashed">
        <h3 className="text-xl font-semibold">No se encontraron sitios</h3>
        <p className="mt-2 text-muted-foreground">
          Intenta con otra búsqueda o crea un nuevo sitio.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {sites.map(
          (
            site: SiteWithCampaignsCount // <-- CORRECCIÓN DE TIPO
          ) => (
            <motion.div
              key={site.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <SiteCard
                site={site}
                onDelete={onDelete}
                isPending={isPending}
                deletingSiteId={deletingSiteId}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Virtualización de la Cuadrícula: Para usuarios con cientos de sitios, renderizar todas las tarjetas puede afectar el rendimiento. Se podría implementar una librería como `TanStack Virtual` para renderizar solo los elementos visibles en la pantalla.
 * 2. Animaciones de Layout: Al filtrar o eliminar sitios, se podría usar `framer-motion` con `AnimatePresence` para animar la entrada y salida de las tarjetas de la cuadrícula, mejorando la fluidez de la interfaz.
 * 3. Ordenamiento de la Cuadrícula: Añadir controles en `SitesHeader` para permitir al usuario ordenar la cuadrícula por fecha de creación, nombre de subdominio o número de campañas.
 */
