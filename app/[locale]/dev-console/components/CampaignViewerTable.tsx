// app/[locale]/dev-console/components/CampaignViewerTable.tsx
/**
 * @file CampaignViewerTable.tsx
 * @description Componente de cliente para el visor de campañas. Ha sido
 *              refactorizado para sincronizar su contrato de tipos con la
 *              capa de datos, resolviendo el error de compilación TS2322.
 * @author L.I.A Legacy
 * @version 2.0.0 (Data Contract Synchronization)
 */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { type CampaignWithSiteInfo } from "@/lib/data/admin"; // Importamos el tipo canónico

// --- INICIO DE REFACTORIZACIÓN DE CONTRATO ---
// El tipo local ahora es una referencia directa al tipo exportado por la capa de datos.
type CampaignRow = CampaignWithSiteInfo;
// --- FIN DE REFACTORIZACIÓN DE CONTRATO ---

export function CampaignViewerTable({
  campaigns,
}: {
  campaigns: CampaignRow[];
}) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Site (Subdomain)</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              {/* --- INICIO DE REFACTORIZACIÓN DE CONTRATO --- */}
              <TableCell>{campaign.sites?.subdomain || "N/A"}</TableCell>
              {/* --- FIN DE REFACTORIZACIÓN DE CONTRATO --- */}
              <TableCell>
                {new Date(campaign.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                {campaign.updated_at
                  ? new Date(campaign.updated_at).toLocaleString()
                  : "Never"}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!campaign.content}
                    >
                      View JSON
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Content for: {campaign.name}</DialogTitle>
                    </DialogHeader>
                    <pre className="mt-2 w-full rounded-lg bg-muted p-4 text-xs overflow-auto max-h-[60vh]">
                      {JSON.stringify(campaign.content, null, 2)}
                    </pre>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Paginación del Lado del Cliente**: ((Vigente)) Para mejorar el rendimiento, se podría implementar paginación en el cliente con `TanStack Table`.
 *
 * @subsection Mejoras Implementadas
 * 1. **Sincronización de Contrato**: ((Implementada)) Se ha actualizado el tipo `CampaignRow` para que coincida con `CampaignWithSiteInfo`, resolviendo el error de compilación.
 * 2. **Fuente de Verdad Única de Tipos**: ((Implementada)) El componente ahora importa su tipo directamente desde la capa de datos, adhiriéndose a las mejores prácticas de arquitectura.
 */
// app/[locale]/dev-console/components/CampaignViewerTable.tsx
