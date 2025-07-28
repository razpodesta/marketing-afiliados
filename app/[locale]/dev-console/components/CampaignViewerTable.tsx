// Ruta: app/[locale]/dev-console/components/CampaignViewerTable.tsx
/**
 * @file CampaignViewerTable.tsx
 * @description Componente de cliente para mostrar una lista de todas las campañas
 * de la plataforma, con la capacidad de previsualizar su contenido JSON.
 * REFACTORIZACIÓN DE TIPOS: Se ha corregido la ruta de importación de los tipos
 * de base de datos para alinearla con la nueva estructura modular.
 *
 * @author Metashark
 * @version 1.2.0 (Type Path Correction)
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
import { type Json } from "@/lib/types/database"; // <-- CORRECCIÓN

type CampaignRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
  slug: string;
  content: Json | null;
  site: { subdomain: string | null } | null;
};

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
              <TableCell>{campaign.site?.subdomain || "N/A"}</TableCell>
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Paginación: La tabla carga todas las campañas a la vez. Implementar paginación en la consulta del servidor y añadir controles de paginación a este componente es crucial para la escalabilidad.
 * 2. Búsqueda y Filtros: Añadir un campo de búsqueda en la parte superior de la tabla para permitir a los desarrolladores filtrar campañas por nombre, sitio o ID.
 * 3. Formateador de JSON: En lugar de un `<pre>` simple, utilizar una librería de resaltado de sintaxis (como `react-syntax-highlighter`) para hacer el contenido JSON en el modal mucho más legible.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Paginación: La tabla carga todas las campañas a la vez. Implementar paginación en la consulta del servidor y añadir controles de paginación a este componente es crucial para la escalabilidad.
 * 2. Búsqueda y Filtros: Añadir un campo de búsqueda en la parte superior de la tabla para permitir a los desarrolladores filtrar campañas por nombre, sitio o ID.
 * 3. Formateador de JSON: En lugar de un `<pre>` simple, utilizar una librería de resaltado de sintaxis (como `react-syntax-highlighter`) para hacer el contenido JSON en el modal mucho más legible.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Paginación: La tabla carga todas las campañas a la vez. Implementar paginación en la consulta del servidor y añadir controles de paginación a este componente es crucial para la escalabilidad.
 * 2. Búsqueda y Filtros: Añadir un campo de búsqueda en la parte superior de la tabla para permitir a los desarrolladores filtrar campañas por nombre, sitio o ID.
 * 3. Formateador de JSON: En lugar de un `<pre>` simple, utilizar una librería de resaltado de sintaxis (como `react-syntax-highlighter`) para hacer el contenido JSON en el modal mucho más legible.
 */
