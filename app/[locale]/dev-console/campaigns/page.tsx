/* Ruta: app/[locale]/dev-console/campaigns/page.tsx */

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { CampaignViewerTable } from "../components/CampaignViewerTable";

/**
 * @file page.tsx
 * @description Página del Visor de Campañas para el `dev-console`.
 * Carga todas las campañas de la plataforma para su supervisión.
 *
 * @author Metashark
 * @version 1.0.0
 */
export default async function CampaignsPage() {
  const supabase = createClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      `
            id,
            name,
            created_at,
            updated_at,
            slug,
            content,
            site:sites (
                subdomain
            )
        `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-destructive">
        Error al cargar las campañas: {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visor de Campañas</h1>
        <p className="text-muted-foreground">
          Supervisa todas las campañas creadas en la plataforma.
        </p>
      </div>
      <CampaignViewerTable campaigns={campaigns as any} />
    </div>
  );
}
/* Ruta: app/[locale]/dev-console/campaigns/page.tsx */
