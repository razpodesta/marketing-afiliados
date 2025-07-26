/* Ruta: app/[locale]/builder/[campaignId]/page.tsx */

import { CampaignConfig } from "@/lib/builder/types.d";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Canvas } from "../components/Canvas";
import { useBuilderStore } from "../core/store";

/**
 * @file page.tsx
 * @description Página principal del constructor para una campaña específica.
 * Con el archivo `database.types.ts` sincronizado, esta página ahora carga
 * los datos de la campaña de forma segura y los inicializa en el store de Zustand.
 *
 * @author Metashark
 * @version 1.2.0 (DB Schema Sync)
 */
export default async function BuilderPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const supabase = createClient();

  const { data: campaignData, error } = await supabase
    .from("campaigns")
    .select("id, name, content")
    .eq("id", params.campaignId)
    .single();

  if (error) {
    logger.error(
      `Error al cargar la campaña ${params.campaignId} para el constructor`,
      error
    );
    return notFound();
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

  useBuilderStore.setState({ campaignConfig });

  return (
    <div className="h-full w-full bg-background p-4">
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white">
        <Canvas />
      </div>
    </div>
  );
}
/* Ruta: app/[locale]/builder/[campaignId]/page.tsx */

/* MEJORAS PROPUESTAS (Consolidadas)
 * 1. **Esqueleto de Carga Sofisticado:** La carga de datos de la campaña puede tomar un momento. En lugar de un `layout.tsx` que se muestra instantáneamente, se podría añadir un `loading.tsx` en esta misma ruta. Este archivo mostraría una versión esquelética del constructor (sidebar y canvas vacíos), mejorando significativamente la experiencia de usuario percibida (LCP y CLS).
 * 2. **Gestión de Permisos a Nivel de Página:** La lógica de permisos para editar esta campaña reside actualmente en la Server Action. Se podría añadir una capa de seguridad adicional aquí, en el servidor. Después de cargar `campaignData`, se podría verificar si el usuario actual es miembro del workspace asociado, llamando a la función `verifyWorkspaceMembership` (propuesta para `actions.ts`). Si no tiene permiso, se podría mostrar una página de "Acceso Denegado" en lugar de `notFound()`.
 * 3. **Estado de Página Pública (`/c/[slug]`):** Implementar la página pública que consumirá el JSON guardado. Se crearía una ruta `app/c/[campaignSlug]/page.tsx` que buscaría la campaña por su `slug`, obtendría el `content` JSON, y lo renderizaría usando el mismo `blockRegistry`, pero esta vez como una página estática (SSG/ISR) para un rendimiento máximo.
 */
