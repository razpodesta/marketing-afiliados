// components/campaigns/CampaignsTable.tsx
/**
 * @file CampaignsTable.tsx
 * @description Componente de presentación puro y reutilizable para renderizar
 *              una tabla de campañas. Encapsula toda la lógica de visualización
 *              de datos y acciones, recibiendo el estado y los manejadores como props.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
"use client";

import { Edit, ShieldAlert, Trash2 } from "lucide-react";
import { useFormatter } from "next-intl";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/navigation";
import type { Tables } from "@/lib/types/database";

type Campaign = Tables<"campaigns">;

interface CampaignsTableProps {
  campaigns: Campaign[];
  isPending: boolean;
  mutatingId: string | null;
  onDelete: (formData: FormData) => void;
}

export function CampaignsTable({
  campaigns,
  isPending,
  mutatingId,
  onDelete,
}: CampaignsTableProps) {
  const format = useFormatter();

  return (
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
                  onConfirm={onDelete}
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
  );
}
