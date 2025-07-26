// NUEVO APARATO: app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CampaignsClient } from "./campaigns-client"; // Crearemos este componente a continuación
import { logger } from "@/lib/logging";

/**
 * @file page.tsx
 * @description Página de servidor para listar las campañas de un sitio específico.
 * Realiza una verificación de permisos crítica para asegurar que el usuario
 * actual pertenece al workspace dueño del sitio antes de cargar los datos.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
async function getCampaignsBySiteId(siteId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name, created_at, updated_at, slug")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(`Error al obtener campañas para el sitio ${siteId}:`, error);
    return [];
  }
  return data;
}

export default async function CampaignsPage({
  params,
}: {
  params: { siteId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?next=/dashboard/sites/${params.siteId}/campaigns`);
  }

  // Verificación de permisos: Cargar el sitio y su workspace_id
  const { data: siteData } = await supabase
    .from("sites")
    .select("id, subdomain, workspace_id")
    .eq("id", params.siteId)
    .single();

  if (!siteData) {
    return notFound();
  }

  // Comprobar si el usuario es miembro de ese workspace
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

  const campaigns = await getCampaignsBySiteId(params.siteId);

  return <CampaignsClient site={siteData} initialCampaigns={campaigns} />;
}
