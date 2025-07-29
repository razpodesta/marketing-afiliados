// components/sites/SitesGrid.tsx
/**
 * @file SitesGrid.tsx
 * @description Componente responsable de renderizar la cuadrícula de sitios
 *              o un estado vacío si no existen sitios.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Type-Safe & Animated)
 */
"use client";

import { Card } from "@/components/ui/card";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
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
        {sites.map((site) => (
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
        ))}
      </AnimatePresence>
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Virtualización de la Cuadrícula: Para usuarios con cientos de sitios, renderizar todas las tarjetas puede afectar el rendimiento. Se podría implementar una librería como `TanStack Virtual` para renderizar solo los elementos visibles en la pantalla, mejorando el uso de memoria y la velocidad de renderizado.
 * 2. Ordenamiento de la Cuadrícula: Añadir controles en `SitesHeader` para permitir al usuario ordenar la cuadrícula por fecha de creación, nombre de subdominio o número de campañas, pasando el estado de ordenamiento a este componente para renderizar la lista en consecuencia.
 * 3. Esqueleto de Carga (Skeleton): Integrar un estado de carga que muestre una versión esquelética de la cuadrícula mientras se obtienen los datos iniciales, mejorando la experiencia de usuario percibida (LCP).
 */
