// components/sites/SitesGrid.tsx
/**
 * @file SitesGrid.tsx
 * @description Componente de presentación puro responsable de renderizar la
 *              cuadrícula de sitios con animaciones o un estado vacío.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
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
