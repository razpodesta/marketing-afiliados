// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
/**
 * @file campaigns-client.tsx
 * @description Componente de cliente para gestionar campañas. Este aparato ha sido
 *              refactorizado para integrarse con la lógica de UI optimista del hook
 *              `useCampaignsManagement`, proporcionando una experiencia de creación
 *              de campañas instantánea y resolviendo inconsistencias de tipos.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 5.2.0 (Type Coercion & Contract Fix)
 *
 * @see {@link file://./campaigns-client.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la gestión de campañas.
 *
 * 1.  **Tabla de Datos Reutilizable (`<DataTable />`)**: (Vigente) A medida que la aplicación crezca, se necesitarán más tablas con funcionalidades similares (ordenamiento, búsqueda). Se podría crear un componente genérico `<DataTable />` para reducir el código repetitivo.
 * 2.  **Búsqueda y Filtros en el Cliente**: (Vigente) Añadir un campo de búsqueda en el encabezado de esta página para permitir al usuario filtrar la lista de campañas por nombre en tiempo real, directamente en el cliente.
 * 3.  **Animaciones de Lista con Framer Motion**: (Vigente) Envolver el `map` de campañas en un componente `<AnimatePresence>` de Framer Motion para animar la entrada y salida de elementos de la lista, mejorando la fluidez visual al crear o eliminar campañas.
 */
"use client";

import { ArrowLeft, Edit, PlusCircle, ShieldAlert, Trash2 } from "lucide-react";
import { useFormatter } from "next-intl";

import { CreateCampaignForm } from "@/components/campaigns";
import { PaginationControls } from "@/components/sites/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
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
import { useCampaignsManagement } from "@/lib/hooks/useCampaignsManagement";
import { Link } from "@/lib/navigation";
import type { Tables } from "@/lib/types/database";

type Campaign = Tables<"campaigns">;
type SiteInfo = { id: string; subdomain: string | null };

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
    mutatingId,
    handleDelete,
    handleCreate,
  } = useCampaignsManagement(initialCampaigns, site.id);

  // CORRECCIÓN: Se utiliza la coerción a booleano (`!!`) para garantizar que el tipo
  // sea siempre `boolean` y nunca `undefined`, cumpliendo el contrato de la prop.
  const isCreating = !!(isPending && mutatingId?.startsWith("optimistic-"));

  return (
    <div className="space-y-6 relative">
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
              onSubmit={handleCreate}
              isPending={isCreating}
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
                <TableRow
                  key={campaign.id}
                  className={
                    campaign.id.startsWith("optimistic-")
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
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
                      <Link
                        href={{
                          pathname: "/builder/[campaignId]",
                          params: { campaignId: campaign.id },
                        }}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Editar
                      </Link>
                    </Button>
                    <ConfirmationDialog
                      triggerButton={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          aria-label={`Eliminar la campaña ${campaign.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                      icon={ShieldAlert}
                      title="¿Eliminar Campaña?"
                      description={
                        <>
                          Esta acción es irreversible. La campaña{" "}
                          <strong className="font-medium text-foreground">
                            {campaign.name}
                          </strong>{" "}
                          será eliminada permanentemente.
                        </>
                      }
                      confirmButtonText="Sí, eliminar"
                      onConfirm={handleDelete}
                      isPending={isPending && mutatingId === campaign.id}
                      hiddenInputs={{ campaignId: campaign.id }}
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
      {/* CORRECCIÓN: Se pasa la ruta plantilla a `basePath` y los params a `routeParams`. */}
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath="/dashboard/sites/[siteId]/campaigns"
        routeParams={{ siteId: site.id }}
      />
    </div>
  );
}
// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
