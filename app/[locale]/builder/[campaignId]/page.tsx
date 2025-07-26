/* Ruta: app/[locale]/builder/[campaignId]/page.tsx */

import { CampaignConfig } from "@/lib/builder/types.d";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Canvas } from "../components/Canvas";
import { useBuilderStore } from "../core/store";

/**
 * @file page.tsx
 * @description Página principal del constructor para una campaña específica.
 * PARCHE DE SEGURIDAD CRÍTICO: Se ha añadido una verificación de permisos
 * para asegurar que solo los miembros del workspace correspondiente puedan
 * cargar y editar una campaña, previniendo la fuga de datos.
 *
 * @author Metashark
 * @version 2.0.0 (Security Patch & Permission Check)
 */
export default async function BuilderPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/login?next=/builder/${params.campaignId}`);
  }

  // Consulta actualizada para incluir el workspace_id a través de la tabla de sitios.
  const { data: campaignData, error } = await supabase
    .from("campaigns")
    .select(
      `
      id, 
      name, 
      content,
      site:sites ( workspace_id )
    `
    )
    .eq("id", params.campaignId)
    .single();

  if (error || !campaignData) {
    logger.error(
      `Error o campaña no encontrada ${params.campaignId} para el constructor`,
      error
    );
    return notFound();
  }

  // @ts-ignore - Supabase types can be tricky with nested selects
  const workspaceId = campaignData.site?.workspace_id;

  if (!workspaceId) {
    logger.error(
      `La campaña ${campaignData.id} no está asociada a ningún workspace.`
    );
    return notFound();
  }

  // **VERIFICACIÓN DE PERMISOS**
  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId);

  if (memberCount === 0) {
    logger.warn(
      `Acceso DENEGADO a la campaña ${params.campaignId} por el usuario ${user.id}.`
    );
    // Redirigir al dashboard es más amigable que un 404 en este caso.
    return redirect("/dashboard");
  }

  const campaignConfig: CampaignConfig =
    (campaignData.content as CampaignConfig | null) ?? {
      id: campaignData.id,
      name: campaignData.name,
      theme: { globalFont: "Inter", globalColors: {} },
      blocks: [
        {
          id: "h1",
          type: "Header1",
          props: { logoText: "Mi Marca", ctaText: "Comprar" },
          styles: {},
        },
        {
          id: "h2",
          type: "Hero1",
          props: {
            title: "Título Increíble",
            subtitle: "Un subtítulo que convierte.",
          },
          styles: {},
        },
      ],
    };

  // Hidratación del store en el servidor
  useBuilderStore.setState({ campaignConfig });

  return (
    <div className="h-full w-full bg-background p-4">
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white shadow-inner">
        <Canvas />
      </div>
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Esqueleto de Carga Sofisticado: Añadir un archivo `loading.tsx` en esta misma ruta. Este archivo podría mostrar una versión esquelética del constructor (sidebar y canvas vacíos), mejorando significativamente la experiencia de usuario percibida (LCP y CLS).
 * 2. Página de "Acceso Denegado" Específica: En lugar de redirigir a `/dashboard`, se podría redirigir a una página `/unauthorized` que explique al usuario por qué no puede acceder a ese recurso, lo cual es una UX más clara.
 * 3. Renderizado de la Página Pública (`/c/[slug]`): Implementar la página pública que consumirá el JSON guardado. Se crearía una ruta `app/c/[campaignSlug]/page.tsx` que buscaría la campaña por su `slug`, obtendría el `content` JSON, y lo renderizaría usando el mismo `blockRegistry` pero como una página estática (SSG/ISR) para un rendimiento máximo.
 */
/* MEJORAS PROPUESTAS (Consolidadas)
 * 1. **Esqueleto de Carga Sofisticado:** La carga de datos de la campaña puede tomar un momento. En lugar de un `layout.tsx` que se muestra instantáneamente, se podría añadir un `loading.tsx` en esta misma ruta. Este archivo mostraría una versión esquelética del constructor (sidebar y canvas vacíos), mejorando significativamente la experiencia de usuario percibida (LCP y CLS).
 * 2. **Gestión de Permisos a Nivel de Página:** La lógica de permisos para editar esta campaña reside actualmente en la Server Action. Se podría añadir una capa de seguridad adicional aquí, en el servidor. Después de cargar `campaignData`, se podría verificar si el usuario actual es miembro del workspace asociado, llamando a la función `verifyWorkspaceMembership` (propuesta para `actions.ts`). Si no tiene permiso, se podría mostrar una página de "Acceso Denegado" en lugar de `notFound()`.
 * 3. **Estado de Página Pública (`/c/[slug]`):** Implementar la página pública que consumirá el JSON guardado. Se crearía una ruta `app/c/[campaignSlug]/page.tsx` que buscaría la campaña por su `slug`, obtendría el `content` JSON, y lo renderizaría usando el mismo `blockRegistry`, pero esta vez como una página estática (SSG/ISR) para un rendimiento máximo.
 */
