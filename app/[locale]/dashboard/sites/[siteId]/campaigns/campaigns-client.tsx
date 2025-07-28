// Ruta: app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, type AppPathname } from "@/navigation";
import {
  ArrowLeft,
  Edit,
  Loader2,
  PlusCircle,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
// Importaciones de la nueva arquitectura
import { CreateCampaignForm } from "@/components/campaigns"; // <-- CORRECCIÓN: Importación desde el barril.
import { PaginationControls } from "@/components/sites/PaginationControls";
import { useCampaignsManagement } from "@/lib/hooks/useCampaignsManagement";
import type { Tables } from "@/lib/types/database";

/**
 * @file campaigns-client.tsx
 * @description Componente de cliente para mostrar y gestionar las campañas de un sitio.
 * REFACTORIZACIÓN ARQUITECTÓNICA:
 * 1. Toda la lógica de estado y los manejadores de eventos han sido abstraídos
 *    al hook personalizado `useCampaignsManagement`.
 * 2. Se ha implementado la actualización optimista para la eliminación de campañas.
 * 3. Corregida la ruta de importación de `CreateCampaignForm`.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Hook-driven Architecture & Stability Patch)
 */

type Campaign = Tables<"campaigns">;
type SiteInfo = { id: string; subdomain: string | null };

const DeleteCampaignDialog = ({
  campaign,
  onDelete,
  isPending,
}: {
  campaign: Campaign;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={onDelete}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              ¿Eliminar Campaña?
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. La campaña{" "}
              <strong className="font-medium text-foreground">
                {campaign.name}
              </strong>{" "}
              será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function CampaignsClient({
  site,
  initialCampaigns,
  totalCount,
  page,
  limit,
}: {
  site: SiteInfo;
  initialCampaigns: Campaign[];
  totalCount: number;
  page: number;
  limit: number;
}) {
  const format = useFormatter();
  const {
    campaigns,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    deletingId,
    handleDelete,
    handleCreateSuccess,
  } = useCampaignsManagement(initialCampaigns);

  return (
    <div className="space-y-6 relative">
      <div
        data-lia-marker="true"
        className="absolute -top-4 left-0 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
      >
        campaigns-client.tsx
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sites">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis Sitios
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Campañas para:{" "}
            <span className="text-primary">{site.subdomain}</span>
          </h1>
          <p className="text-muted-foreground">
            Crea y edita las páginas para este sitio.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <CreateCampaignForm
              siteId={site.id}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    /{campaign.slug}
                  </TableCell>
                  <TableCell>
                    {format.dateTime(
                      new Date(campaign.updated_at || campaign.created_at),
                      "medium"
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/builder/${campaign.id}` as AppPathname}>
                        <Edit className="mr-2 h-3 w-3" />
                        Editar
                      </Link>
                    </Button>
                    <DeleteCampaignDialog
                      campaign={campaign}
                      onDelete={handleDelete}
                      isPending={isPending && deletingId === campaign.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se han creado campañas para este sitio todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath={`/dashboard/sites/${site.id}/campaigns`}
      />
    </div>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha sido refactorizado para seguir el patrón "Componente de Presentación Orquestado".
 *  Toda la lógica de estado compleja y los manejadores de eventos se han abstraído en
 *  el hook personalizado `useCampaignsManagement`.
 *  1.  **Inicialización y Consumo del Hook:** Al montarse, invoca `useCampaignsManagement` con
 *      los datos iniciales de campañas del servidor. El hook devuelve todo el estado
 *      necesario (la lista de campañas, estados de carga, etc.) y las funciones para
 *      manipularlo (`handleDelete`, `handleCreateSuccess`).
 *  2.  **Orquestación de Props (Piping):** El componente actúa como un conducto, pasando el estado y
 *      los manejadores devueltos por el hook a sus componentes hijos. Por ejemplo, `campaigns` se
 *      pasa a la `<TableBody>`, y `handleDelete` se pasa al `DeleteCampaignDialog`.
 *  3.  **Manejo de Eliminación Optimista:** La función `handleDelete` (proveniente del hook)
 *      ahora actualiza la UI de forma optimista. Cuando se llama, elimina inmediatamente
 *      la campaña del estado local, proporcionando una respuesta visual instantánea. Si la
 *      acción del servidor falla, el hook se encarga de revertir el estado.
 *  Este patrón hace que el componente `CampaignsClient` sea declarativo, fácil de leer y
 *  consistente con la arquitectura de `SitesClient`.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Actualización Optimista para Creación: Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. El hook `useCampaignsManagement` puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2. Tabla de Datos Reutilizable y Avanzada: A medida que la aplicación crezca, se necesitarán más tablas con funcionalidades similares (ordenamiento, búsqueda, selección). Se podría crear un componente genérico `<DataTable />` (usando una librería como `TanStack Table`) que encapsule toda esta funcionalidad, y luego usarlo aquí y en otras páginas para mostrar los datos, reduciendo drásticamente el código repetitivo.
 * 3. Búsqueda y Filtros en el Cliente: Añadir un campo de búsqueda en el encabezado de esta página para permitir al usuario filtrar la lista de campañas por nombre en tiempo real, directamente en el cliente. Esto mejoraría la usabilidad para sitios con un gran número de campañas en la página actual.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha sido refactorizado para seguir el patrón "Componente de Presentación Orquestado".
 *  Toda la lógica de estado compleja y los manejadores de eventos se han abstraído en
 *  el hook personalizado `useCampaignsManagement`.
 *  1.  **Inicialización y Consumo del Hook:** Al montarse, invoca `useCampaignsManagement` con
 *      los datos iniciales de campañas del servidor. El hook devuelve todo el estado
 *      necesario (la lista de campañas, estados de carga, etc.) y las funciones para
 *      manipularlo (`handleDelete`, `handleCreateSuccess`).
 *  2.  **Orquestación de Props (Piping):** El componente actúa como un conducto, pasando el estado y
 *      los manejadores devueltos por el hook a sus componentes hijos. Por ejemplo, `campaigns` se
 *      pasa a la `<TableBody>`, y `handleDelete` se pasa al `DeleteCampaignDialog`.
 *  3.  **Manejo de Eliminación Optimista:** La función `handleDelete` (proveniente del hook)
 *      ahora actualiza la UI de forma optimista. Cuando se llama, elimina inmediatamente
 *      la campaña del estado local, proporcionando una respuesta visual instantánea. Si la
 *      acción del servidor falla, el hook se encarga de revertir el estado.
 *  Este patrón hace que el componente `CampaignsClient` sea declarativo, fácil de leer y
 *  consistente con la arquitectura de `SitesClient`.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Actualización Optimista para Creación: Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. El hook `useCampaignsManagement` puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2. Tabla de Datos Reutilizable y Avanzada: A medida que la aplicación crezca, se necesitarán más tablas con funcionalidades similares (ordenamiento, búsqueda, selección). Se podría crear un componente genérico `<DataTable />` (usando una librería como `TanStack Table`) que encapsule toda esta funcionalidad, y luego usarlo aquí y en otras páginas para mostrar los datos, reduciendo drásticamente el código repetitivo.
 * 3. Búsqueda y Filtros en el Cliente: Añadir un campo de búsqueda en el encabezado de esta página para permitir al usuario filtrar la lista de campañas por nombre en tiempo real, directamente en el cliente. Esto mejoraría la usabilidad para sitios con un gran número de campañas en la página actual.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha sido refactorizado para seguir el patrón "Componente de Presentación Orquestado".
 *  Toda la lógica de estado compleja y los manejadores de eventos se han abstraído en
 *  el hook personalizado `useCampaignsManagement`.
 *  1.  **Inicialización y Consumo del Hook:** Al montarse, invoca `useCampaignsManagement` con
 *      los datos iniciales de campañas del servidor. El hook devuelve todo el estado
 *      necesario (la lista de campañas, estados de carga, etc.) y las funciones para
 *      manipularlo (`handleDelete`, `handleCreateSuccess`).
 *  2.  **Orquestación de Props (Piping):** El componente actúa como un conducto, pasando el estado y
 *      los manejadores devueltos por el hook a sus componentes hijos. Por ejemplo, `campaigns` se
 *      pasa a la `<TableBody>`, y `handleDelete` se pasa al `DeleteCampaignDialog`.
 *  3.  **Manejo de Eliminación Optimista:** La función `handleDelete` (proveniente del hook)
 *      ahora actualiza la UI de forma optimista. Cuando se llama, elimina inmediatamente
 *      la campaña del estado local, proporcionando una respuesta visual instantánea. Si la
 *      acción del servidor falla, el hook se encarga de revertir el estado.
 *  Este patrón hace que el componente `CampaignsClient` sea declarativo, fácil de leer y
 *  consistente con la arquitectura de `SitesClient`.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Actualización Optimista para Creación: Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. El hook `useCampaignsManagement` puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2. Tabla de Datos Reutilizable y Avanzada: A medida que la aplicación crezca, se necesitarán más tablas con funcionalidades similares (ordenamiento, búsqueda, selección). Se podría crear un componente genérico `<DataTable />` (usando una librería como `TanStack Table`) que encapsule toda esta funcionalidad, y luego usarlo aquí y en otras páginas para mostrar los datos, reduciendo drásticamente el código repetitivo.
 * 3. Búsqueda y Filtros en el Cliente: Añadir un campo de búsqueda en el encabezado de esta página para permitir al usuario filtrar la lista de campañas por nombre en tiempo real, directamente en el cliente. Esto mejoraría la usabilidad para sitios con un gran número de campañas en la página actual.
 */
