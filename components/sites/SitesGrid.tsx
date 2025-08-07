// components/sites/SitesGrid.tsx
/**
 * @file SitesGrid.tsx
 * @description Componente de presentación puro responsable de renderizar la
 *              cuadrícula de sitios. Refatorado para receber todos os textos
 *              do estado vazio e dos seus filhos via props.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 4.0.0 (Pure I18n Component)
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";

import { DeleteSiteDialogTexts, SiteCard, SiteCardTexts } from "./SiteCard";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
export interface SitesGridTexts {
  emptyStateTitle: string;
  emptyStateDescription: string;
}

interface SitesGridProps {
  sites: SiteWithCampaignsCount[];
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  deletingSiteId: string | null;
  texts: SitesGridTexts;
  cardTexts: SiteCardTexts;
  deleteDialogTexts: DeleteSiteDialogTexts;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

export function SitesGrid({
  sites,
  onDelete,
  isPending,
  deletingSiteId,
  texts,
  cardTexts,
  deleteDialogTexts,
}: SitesGridProps) {
  if (sites.length === 0) {
    return (
      <Card className="flex h-64 flex-col items-center justify-center p-8 text-center border-dashed">
        <h3 className="text-xl font-semibold">{texts.emptyStateTitle}</h3>
        <p className="mt-2 text-muted-foreground">
          {texts.emptyStateDescription}
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
              texts={cardTexts}
              deleteDialogTexts={deleteDialogTexts}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) O componente agora recebe todos os textos necessários para si e para seus filhos, propagando o contrato de internacionalização.
 */
// components/sites/SitesGrid.tsx
