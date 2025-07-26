// NUEVO APARATO: app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFormatter } from "next-intl";

/**
 * @typedef {object} Campaign
 * @property {string} id
 * @property {string} name
 * @property {string} created_at
 * @property {string | null} updated_at
 * @property {string} slug
 */
type Campaign = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
  slug: string;
};

/**
 * @typedef {object} SiteInfo
 * @property {string} id
 * @property {string | null} subdomain
 */
type SiteInfo = {
  id: string;
  subdomain: string | null;
};

/**
 * @file campaigns-client.tsx
 * @description Componente de cliente para mostrar y gestionar las campañas de un sitio.
 * Este componente contiene el enlace final y funcional que dirige al usuario al
 * editor de campañas (`/builder/[campaignId]`).
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
export function CampaignsClient({
  site,
  initialCampaigns,
}: {
  site: SiteInfo;
  initialCampaigns: Campaign[];
}) {
  const format = useFormatter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Campaña</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCampaigns.length > 0 ? (
              initialCampaigns.map((campaign) => (
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
                      {/* ESTE ES EL ENLACE CORRECTO Y FUNCIONAL AL CONSTRUCTOR */}
                      <Link href={`/builder/${campaign.id}`}>
                        <Edit className="mr-2 h-3 w-3" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    </div>
  );
}
