// components/sites/SiteCard.tsx
/**
 * @file SiteCard.tsx
 * @description Componente de UI que renderiza uma tarjeta individual para un sitio.
 *              Refatorado para ser um componente de apresentação puro que recebe
 *              todos os seus textos via props, cumprindo com o mandato de i18n.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 6.0.0 (Pure I18n Component)
 */
"use client";

import { ExternalLink } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { Link } from "@/lib/navigation";
import { protocol, rootDomain } from "@/lib/utils";
import {
  DeleteSiteDialog,
  type DeleteSiteDialogTexts,
} from "./DeleteSiteDialog";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
export interface SiteCardTexts {
  campaignCount: (count: number) => string;
  manageCampaignsButton: string;
  deleteSiteAriaLabel: (subdomain: string) => string;
  openSiteAriaLabel: string;
  popoverTitle: string;
  popoverDescription: string;
}

// Re-exporta o tipo para o componente pai
export type { DeleteSiteDialogTexts };

interface SiteCardProps {
  site: SiteWithCampaignsCount;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  deletingSiteId: string | null;
  texts: SiteCardTexts;
  deleteDialogTexts: DeleteSiteDialogTexts;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

export function SiteCard({
  site,
  onDelete,
  isPending,
  deletingSiteId,
  texts,
  deleteDialogTexts,
}: SiteCardProps) {
  const getCampaignCount = (currentSite: SiteWithCampaignsCount): number => {
    return currentSite.campaigns?.[0]?.count ?? 0;
  };
  const campaignCount = getCampaignCount(site);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{site.subdomain}</CardTitle>
                <CardDescription>
                  {texts.campaignCount(campaignCount)}
                </CardDescription>
              </div>
              <div className="text-4xl">{site.icon}</div>
            </div>
          </CardHeader>
          <CardFooter className="justify-between">
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/dashboard/sites/[siteId]/campaigns",
                  params: { siteId: site.id },
                }}
              >
                {texts.manageCampaignsButton}
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`${protocol}://${site.subdomain}.${rootDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={texts.openSiteAriaLabel}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <DeleteSiteDialog
                site={{ id: site.id, subdomain: site.subdomain }}
                onDelete={onDelete}
                isPending={isPending && deletingSiteId === site.id}
                onClick={(e) => e.stopPropagation()}
                texts={deleteDialogTexts}
              />
            </div>
          </CardFooter>
        </Card>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <h4 className="font-semibold">{texts.popoverTitle}</h4>
          <p className="text-sm text-muted-foreground mt-2">
            {texts.popoverDescription}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) O componente agora é 100% agnóstico ao conteúdo, recebendo todos os seus textos e os textos de seus filhos via props.
 * 2. **Exportação de Tipos Aninhados**: ((Implementada)) O componente agora exporta os tipos de texto que seu filho (`DeleteSiteDialog`) precisa, permitindo que o orquestrador (`SitesGrid`) os forneça.
 */
// components/sites/SiteCard.tsx
