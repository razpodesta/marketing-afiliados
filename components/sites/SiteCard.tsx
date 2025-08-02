// components/sites/SiteCard.tsx
/**
 * @file SiteCard.tsx
 * @description Componente de UI que renderiza una tarjeta individual para un sitio.
 *              Este aparato muestra información clave como el subdominio y el número de campañas,
 *              y proporciona acciones contextuales como la navegación a la gestión de campañas,
 *              la visita al sitio público y la iniciación del flujo de eliminación.
 *              Está diseñado para ser interactivo, mostrando detalles adicionales en un Popover
 *              al pasar el cursor, y delega la lógica de estado y las acciones a su
 *              componente padre a través de props.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.3.0 (Holistic Accessibility & Event Delegation Fix)
 * @param {object} props - Las propiedades del componente.
 * @param {SiteWithCampaignsCount} props.site - El objeto de datos del sitio a renderizar, incluyendo la cuenta de campañas.
 * @param {(formData: FormData) => void} props.onDelete - Callback que se ejecuta cuando se confirma la eliminación del sitio.
 * @param {boolean} props.isPending - Estado de carga para la acción de eliminación.
 * @param {string | null} props.deletingSiteId - El ID del sitio que se está eliminando actualmente.
 * @returns {JSX.Element} Un componente de tarjeta de sitio interactivo y completamente funcional.
 */
"use client";

import { ExternalLink } from "lucide-react";

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

import { DeleteSiteDialog } from "./DeleteSiteDialog";

export function SiteCard({
  site,
  onDelete,
  isPending,
  deletingSiteId,
}: {
  site: SiteWithCampaignsCount;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  deletingSiteId: string | null;
}) {
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
                  {campaignCount} {campaignCount === 1 ? "Campaña" : "Campañas"}
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
                Gestionar Campañas
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`${protocol}://${site.subdomain}.${rootDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Abrir sitio en una nueva pestaña"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <DeleteSiteDialog
                site={{ id: site.id, subdomain: site.subdomain }}
                onDelete={onDelete}
                isPending={isPending && deletingSiteId === site.id}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </CardFooter>
        </Card>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <h4 className="font-semibold">Previsualización Rápida</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Una previsualización del sitio aparecerá aquí. (Funcionalidad en
            desarrollo).
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
// components/sites/SiteCard.tsx
