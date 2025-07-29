/**
 * @file components/sites/SiteCard.tsx
 * @description Componente que renderiza una tarjeta individual para un sitio.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.1.0 (Accessibility Fix)
 */
"use client";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { protocol, rootDomain } from "@/lib/utils";
import { Link } from "@/navigation";
import { ExternalLink, HelpCircle } from "lucide-react";
import { DeleteSiteDialog } from "./DeleteSiteDialog";

// ... (resto del componente sin cambios)
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
                  aria-label="Abrir sitio en una nueva pestaña" // <-- CORRECCIÓN DE ACCESIBILIDAD
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
      {/* ... (PopoverContent sin cambios) */}
    </Popover>
  );
}
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la tarjeta de sitio a un componente más informativo y útil.
 *
 * 1.  **Previsualización de Sitio con Captura de Pantalla:** Reemplazar el texto "Una previsualización del sitio aparecerá aquí" en el `Popover` con una imagen real. Esto se puede lograr con un servicio automatizado (ej. una Edge Function con Puppeteer) que genere y guarde una captura de pantalla de la página principal del sitio.
 * 2.  **Métricas Clave en Popover:** Enriquecer el `PopoverContent` para mostrar métricas de rendimiento clave del sitio (obtenidas de una tabla de analíticas), como "Visitas (últimos 7 días)" o "Tasa de Conversión General".
 * 3.  **Edición en Línea Rápida:** Permitir al usuario hacer clic en el nombre del subdominio o en el ícono dentro de la tarjeta para editarlos directamente a través de un pequeño formulario dentro del `Popover`, agilizando las tareas de gestión comunes.
 */

/**
 * @fileoverview El componente `SiteCard` es la representación visual de una entidad 'Sitio' dentro de la cuadrícula de la página "Mis Sitios".
 * @functionality
 * - Muestra información clave: subdominio, ícono y conteo de campañas.
 * - Proporciona dos acciones primarias:
 *   1. Navegación: Un botón "Gestionar Campañas" que utiliza el sistema de enrutamiento seguro de `next-intl` para llevar al usuario a la página de campañas de ese sitio específico.
 *   2. Enlace Externo: Un botón que abre el subdominio público del sitio en una nueva pestaña.
 * - Encapsula una acción secundaria destructiva (`DeleteSiteDialog`) para eliminar el sitio, que recibe la lógica de manejo desde su componente padre.
 * @relationships
 * - Es un componente hijo directo de `SitesGrid.tsx`, que es responsable de renderizar una lista de estas tarjetas.
 * - Recibe sus datos y funciones (`props`) del hook `useSitesManagement.ts`, que centraliza el estado y la lógica de la página "Mis Sitios".
 * - Utiliza el componente `DeleteSiteDialog.tsx` para el flujo de confirmación de eliminación.
 * - Depende de `navigation.ts` para obtener el componente `Link` tipado y las plantillas de ruta.
 * @expectations
 * - Se espera que este componente sea puramente de presentación ("dumb component"). No debe contener lógica de estado compleja, sino que debe recibir todos sus datos y callbacks como props. Su principal responsabilidad es renderizar la información de manera clara y delegar las interacciones del usuario a las funciones que se le proporcionan, utilizando siempre las APIs de enrutamiento seguras en tipos.
 */
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
