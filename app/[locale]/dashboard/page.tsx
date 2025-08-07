// app/[locale]/dashboard/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada del servidor para el dashboard. Refactorizado
 *              para operar en modo de producción, con full observabilidad y
 *              full internacionalización.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 3.0.0 (Production-Only, I18n & Observability)
 */
import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { campaigns as campaignsData } from "@/lib/data";
import { logger } from "@/lib/logging";

import { DashboardClient } from "./dashboard-client";

const PageSkeleton = () => (
  <div className="flex h-full flex-col gap-8 animate-pulse">
    <div className="space-y-1">
      <div className="h-8 w-1/3 rounded-md bg-muted" />
      <div className="h-5 w-1/2 rounded-md bg-muted" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
      <div className="h-32 rounded-lg bg-muted md:col-span-1" />
    </div>
    <div className="space-y-4">
      <div className="h-6 w-1/4 rounded-md bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    </div>
  </div>
);

async function DashboardPageLoader() {
  const cookieStore = cookies();
  const activeWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  if (!activeWorkspaceId) {
    logger.warn(
      "[DashboardPageLoader] No active workspace found. Cannot load recent campaigns."
    );
    return <DashboardClient recentCampaigns={[]} />;
  }

  try {
    logger.trace(
      `[DashboardPageLoader] Fetching recent campaigns for workspace: ${activeWorkspaceId}`
    );
    const recentCampaigns =
      await campaignsData.getRecentCampaignsByWorkspaceId(activeWorkspaceId);
    return <DashboardClient recentCampaigns={recentCampaigns} />;
  } catch (error) {
    const errorContext =
      error instanceof Error
        ? { message: error.message }
        : { error: String(error) };
    logger.error(
      `[DashboardPageLoader] Failed to load recent campaigns for workspace: ${activeWorkspaceId}`,
      errorContext
    );

    // --- REFACTORIZACIÓN: Internacionalización del Error ---
    const t = await getTranslations("DashboardPage");
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

export default async function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPageLoader />
    </Suspense>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Modo Exclusivo de Producción**: ((Implementada)) Se ha eliminado la lógica `DEV_MODE`.
 * 2. **Full Internacionalización**: ((Implementada)) El estado de error ahora consume textos desde `next-intl`.
 * 3. **Full Observabilidad**: ((Implementada)) Los logs de advertencia y error ahora incluyen el `workspaceId` para un diagnóstico preciso.
 */
// app/[locale]/dashboard/page.tsx
