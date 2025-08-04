// app/[locale]/dev-console/campaigns/page.tsx
/**
 * @file page.tsx
 * @description Página del Visor de Campañas. Ha sido refactorizada para
 *              consumir la capa de datos canónica, eliminando consultas directas
 *              y aserciones de tipo inseguras (`as any`).
 * @author L.I.A Legacy
 * @version 2.0.0 (Data Layer Abstraction)
 */
import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { admin as adminData } from "@/lib/data";

import { CampaignViewerTable } from "../components/CampaignViewerTable";

export default async function CampaignsPage() {
  try {
    // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    // La consulta directa ha sido reemplazada por una llamada a la capa de datos.
    const campaigns = await adminData.getAllCampaignsWithSiteInfo();
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Visor de Campañas</h1>
          <p className="text-muted-foreground">
            Supervisa todas las campañas creadas en la plataforma.
          </p>
        </div>
        <CampaignViewerTable campaigns={campaigns} />
      </div>
    );
  } catch (error) {
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar Campañas
        </h2>
        <p className="text-muted-foreground mt-2">
          No se pudo obtener la información desde la capa de datos.
        </p>
      </Card>
    );
  }
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Implementadas
 * 1. **Abstracción de Capa de Datos**: ((Implementada)) Se ha eliminado la consulta directa a Supabase.
 * 2. **Seguridad de Tipos**: ((Implementada)) Se ha eliminado la aserción `as any`, y el componente ahora recibe datos fuertemente tipados.
 */
// app/[locale]/dev-console/campaigns/page.tsx
