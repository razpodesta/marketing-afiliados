// app/[locale]/dev-console/campaigns/page.tsx
/**
 * @file page.tsx
 * @description Página del Visor de Campañas. Refactorizada para una
 *              internacionalización y observabilidad completas.
 * @author L.I.A Legacy
 * @version 3.0.0 (I18n & Observability)
 * @see tests/integration/app/[locale]/dev-console/campaigns/page.test.tsx
 */
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { admin as adminData } from "@/lib/data";
import { logger } from "@/lib/logging";

import { CampaignViewerTable } from "../components/CampaignViewerTable";

export default async function CampaignsPage() {
  const t = await getTranslations("DevConsole.CampaignsTable");

  try {
    const campaigns = await adminData.getAllCampaignsWithSiteInfo();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CampaignViewerTable campaigns={campaigns} />
      </div>
    );
  } catch (error) {
    logger.error(
      "[DevConsole:CampaignsPage] Error al cargar la lista de campañas:",
      error instanceof Error ? error.message : String(error)
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          {t("error_title")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("error_description")}</p>
      </Card>
    );
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Internacionalización Completa**: ((Implementada)) El componente ahora usa `getTranslations` para renderizar el título, la descripción y los mensajes de error, eliminando todo el texto codificado en duro.
 * 2. **Observabilidad Mejorada**: ((Implementada)) El bloque `catch` ahora registra el error en el servidor con `logger.error`, proporcionando visibilidad completa sobre los fallos de la capa de datos.
 *
 * @subsection Melhorias Futuras
 * 1. **Paginación del Lado del Servidor**: ((Vigente)) Para escalar a miles de campañas, la llamada a `adminData.getAllCampaignsWithSiteInfo` debería aceptar parámetros de paginación leídos desde la URL.
 */
// app/[locale]/dev-console/campaigns/page.tsx
