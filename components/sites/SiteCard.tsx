// Ruta: components/sites/SiteCard.tsx
/**
 * @file SiteCard.tsx
 * @description Componente que renderiza una tarjeta individual para un sitio.
 *              Refactorizado para una máxima accesibilidad y una correcta
 *              delegación de eventos.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.3.0 (Holistic Accessibility & Event Delegation Fix)
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
// Ruta: components/sites/SiteCard.tsx
/* MEJORAS FUTURAS DETECTADAS
 * 1. Previsualización de Sitio con Captura de Pantalla: La mejora de UX más impactante sería reemplazar el texto "Una previsualización del sitio aparecerá aquí" con una imagen real. Esto se puede lograr con un servicio automatizado (ej. una Edge Function con Puppeteer o una API de terceros) que genere y guarde una captura de pantalla de la página principal del sitio cada vez que se actualice una campaña.
 * 2. Métricas Clave en Popover: Enriquecer el `PopoverContent` para mostrar métricas de rendimiento clave del sitio (obtenidas de una tabla de analíticas), como "Visitas (últimos 7 días)" o "Tasa de Conversión General". Esto proporcionaría valor inmediato al usuario sin necesidad de navegar a una sección de analíticas completa.
 * 3. Edición en Línea Rápida: Permitir al usuario hacer clic en el nombre del subdominio o en el ícono dentro de la tarjeta para editarlos directamente a través de un pequeño formulario dentro del `Popover`. Esto requeriría una nueva `Server Action` (`updateSiteDetailsAction`) y agilizaría significativamente las tareas de gestión comunes.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Generación de Capturas de Pantalla: La previsualización actual es un placeholder. Se podría implementar un servicio (ej. una Edge Function con Puppeteer) que genere y guarde capturas de pantalla de los sitios para mostrarlas en el popover.
 * 2. Métricas Rápidas en Popover: El contenido del popover podría enriquecerse con métricas clave del sitio obtenidas de una tabla de analíticas, como "Visitas (últimos 7 días)" o "Tasa de Conversión".
 * 3. Actualización de Icono/Nombre en Línea: Permitir al usuario hacer clic en el nombre o icono dentro de la tarjeta para editarlos directamente a través de un pequeño formulario en el popover.
 */
