// Ruta: app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para listar las campañas de un sitio específico.
 * REFACTORIZACIÓN 360 - ESCALABILIDAD Y UX:
 * 1. Implementada la paginación del lado del servidor para las campañas.
 * 2. Se ha añadido un `BreadcrumbsProvider` para pasar el nombre del sitio a
 *    la UI, mejorando la navegación contextual.
 * 3. Incorporado manejo de errores robusto.
 *
 * @author Metashark
 * @version 2.0.0 (Scalable & Context-Aware Page)
 */
import { Card } from "@/components/ui/card";
import { BreadcrumbsProvider } from "@/lib/context/BreadcrumbsContext";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { CampaignsClient } from "./campaigns-client";

const CAMPAIGNS_PER_PAGE = 10;

/**
 * @description Obtiene una lista paginada de campañas para un sitio específico.
 * @param {string} siteId - El UUID del sitio.
 * @param {{ page: number; limit: number }} options - Opciones de paginación.
 * @returns {Promise<{campaigns: any[], totalCount: number}>}
 */
async function getPaginatedCampaignsBySiteId(
  siteId: string,
  { page, limit }: { page: number; limit: number }
) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("campaigns")
    .select("id, name, created_at, updated_at, slug", { count: "exact" })
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`Error al obtener campañas para el sitio ${siteId}:`, error);
    throw new Error("No se pudieron obtener las campañas.");
  }
  return { campaigns: data, totalCount: count || 0 };
}

export default async function CampaignsPage({
  params,
  searchParams,
}: {
  params: { siteId: string };
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?next=/dashboard/sites/${params.siteId}/campaigns`);
  }

  const { data: siteData } = await supabase
    .from("sites")
    .select("id, subdomain, workspace_id")
    .eq("id", params.siteId)
    .single();

  if (!siteData) return notFound();

  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("workspace_id", siteData.workspace_id);

  if (memberCount === 0) {
    logger.warn(
      `Acceso DENEGADO al sitio ${params.siteId} por el usuario ${user.id}.`
    );
    return redirect("/dashboard/sites");
  }

  try {
    const page = Number(searchParams.page) || 1;
    const { campaigns, totalCount } = await getPaginatedCampaignsBySiteId(
      params.siteId,
      {
        page,
        limit: CAMPAIGNS_PER_PAGE,
      }
    );

    return (
      <BreadcrumbsProvider
        nameMap={{ [siteData.id]: siteData.subdomain || "Sitio" }}
      >
        <CampaignsClient
          site={siteData}
          initialCampaigns={campaigns}
          totalCount={totalCount}
          page={page}
          limit={CAMPAIGNS_PER_PAGE}
        />
      </BreadcrumbsProvider>
    );
  } catch (error) {
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar las Campañas
        </h2>
        <p className="text-muted-foreground mt-2">
          No pudimos obtener la información de las campañas. Por favor, intenta
          recargar la página.
        </p>
      </Card>
    );
  }
}
