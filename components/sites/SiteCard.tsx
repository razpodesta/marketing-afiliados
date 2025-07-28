// Ruta: components/sites/SiteCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { protocol, rootDomain } from "@/lib/utils";
import { Link as IntlLink } from "@/navigation";
import { ExternalLink, HelpCircle } from "lucide-react";
import { DeleteSiteDialog } from "./DeleteSiteDialog";

/**
 * @file SiteCard.tsx
 * @description Componente que renderiza una tarjeta individual para un sitio.
 * REFACTORIZACIÓN DE UX:
 * 1.  Se ha añadido un icono de ayuda contextual en el popover para explicar
 *     el propósito de los "Sitios" y "Campañas" a los nuevos usuarios.
 * 2.  Se ha implementado el marcador visual temporal para identificación en desarrollo.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Contextual Help & Dev Markers)
 */

interface SiteCardProps {
  site: SiteWithCampaignsCount;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
  deletingSiteId: string | null;
}

export function SiteCard({
  site,
  onDelete,
  isPending,
  deletingSiteId,
}: SiteCardProps) {
  const getCampaignCount = (currentSite: SiteWithCampaignsCount): number => {
    if (
      currentSite.campaigns &&
      Array.isArray(currentSite.campaigns) &&
      currentSite.campaigns.length > 0
    ) {
      return (currentSite.campaigns[0] as { count: number }).count;
    }
    return 0;
  };

  const campaignCount = getCampaignCount(site);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg relative">
          {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
          <div
            data-lia-marker="true"
            className="absolute top-2 left-2 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10"
          >
            SiteCard.tsx
          </div>
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
              <IntlLink href={`/dashboard/sites/${site.id}/campaigns` as any}>
                Gestionar Campañas
              </IntlLink>
            </Button>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`${protocol}://${site.subdomain}.${rootDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteSiteDialog
                  site={{ id: site.id, subdomain: site.subdomain }}
                  onDelete={onDelete}
                  isPending={isPending && deletingSiteId === site.id}
                />
              </div>
            </div>
          </CardFooter>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{site.icon}</div>
          <div className="space-y-1">
            <h4 className="font-semibold leading-none">{site.subdomain}</h4>
            <p className="text-sm text-muted-foreground">
              Una previsualización del sitio aparecerá aquí.
            </p>
          </div>
          {/* DIRECTIVA: Ayuda contextual */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger className="absolute top-3 right-3">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">
                  Un 'Sitio' es tu subdominio público. Dentro de cada sitio,
                  puedes crear múltiples 'Campañas' (páginas).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de presentación altamente cohesivo que representa
 *  una entidad "Sitio".
 *  1.  **Recepción de Datos y Funciones:** Recibe un objeto `site` con todos los datos a mostrar y callbacks (`onDelete`) para las acciones, delegando la lógica de negocio al componente padre.
 *  2.  **Extracción de Datos Anidados:** La función `getCampaignCount` aísla de forma segura la lógica para extraer el número de campañas desde la estructura de datos anidada que proporciona Supabase, evitando errores si el formato cambia.
 *  3.  **Gestión de Eventos:** Utiliza `e.stopPropagation()` en los manejadores de clic de los botones internos. Esto es crucial para prevenir que el clic se "propague" al contenedor `Card` y active el `PopoverTrigger`, asegurando que solo la acción deseada se ejecute.
 *  4.  **Composición de UI:** Compone múltiples elementos de UI (Card, Popover, Tooltip, Dialog) para crear una experiencia de usuario rica. El `Popover` ofrece una previsualización rápida en `hover`, mientras que `DeleteSiteDialog` encapsula una acción destructiva en un flujo de confirmación seguro.
 *  El comportamiento esperado es que esta tarjeta actúe como un resumen visual y un punto de acceso a las operaciones más comunes para un sitio, sin gestionar ningún estado complejo por sí misma.
 */

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
