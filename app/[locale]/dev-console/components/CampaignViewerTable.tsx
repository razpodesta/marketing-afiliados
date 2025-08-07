// app/[locale]/dev-console/components/CampaignViewerTable.tsx
/**
 * @file CampaignViewerTable.tsx
 * @description Componente de cliente para el visor de campañas. Refactorizado
 *              para ser completamente internacionalizado.
 * @author L.I.A Legacy
 * @version 3.0.0 (Full Internationalization)
 */
"use client";

import { useTranslations } from "next-intl";
import React from "react";

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
import { type CampaignWithSiteInfo } from "@/lib/data/admin";

type CampaignRow = CampaignWithSiteInfo;

export function CampaignViewerTable({
  campaigns,
}: {
  campaigns: CampaignRow[];
}) {
  const t = useTranslations("DevConsole.CampaignsTable");

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("header_name")}</TableHead>
            <TableHead>{t("header_site")}</TableHead>
            <TableHead>{t("header_created")}</TableHead>
            <TableHead>{t("header_updated")}</TableHead>
            <TableHead>{t("header_actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.sites?.subdomain || "N/A"}</TableCell>
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
                      {t("action_view_json")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {t("dialog_title", { campaignName: campaign.name })}
                      </DialogTitle>
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
 * @subsection Melhorias Adicionadas
 * 1. **Internacionalización Completa**: ((Implementada)) Todos los textos visibles, incluyendo cabeceras de tabla, botones y títulos de diálogo, ahora se consumen desde `next-intl`.
 *
 * @subsection Melhorias Futuras
 * 1. **Paginación del Lado del Cliente**: ((Vigente)) Para mejorar el rendimiento con un gran número de campañas, se podría implementar paginación y ordenamiento en el cliente con `@tanstack/react-table`.
 */
// app/[locale]/dev-console/components/CampaignViewerTable.tsx
