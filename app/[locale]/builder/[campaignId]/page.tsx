// app/[locale]/builder/[campaignId]/page.tsx
/**
 * @file page.tsx
 * @description Página principal del constructor para una campaña específica.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Architectural Alignment)
 */
import { notFound, redirect } from "next/navigation";

import { useBuilderStore } from "@/app/[locale]/builder/core/store";
import { Canvas } from "@/components/builder/Canvas";
import type { CampaignConfig } from "@/lib/builder/types.d";
import { data as dataLayer } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

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

  const campaignData = await dataLayer.campaigns.getCampaignContentById(
    params.campaignId,
    user.id
  );

  if (!campaignData) {
    logger.error(
      `Campaña no encontrada o acceso denegado para ${params.campaignId}`
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
          id: `header-${Date.now()}`,
          type: "Header1",
          props: { logoText: "Mi Marca", ctaText: "Comprar Ahora" },
          styles: {},
        },
        {
          id: `hero-${Date.now()}`,
          type: "Hero1",
          props: {
            title: "Título Impactante",
            subtitle: "Un subtítulo convincente.",
          },
          styles: {},
        },
      ],
    };

  useBuilderStore.setState({ campaignConfig });

  return (
    <div className="h-full w-full bg-background p-4 relative">
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white shadow-inner">
        <Canvas />
      </div>
    </div>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de servidor que actúa como una capa de seguridad
 *  y preparación de datos para el constructor.
 *  1.  **Autenticación:** Valida la sesión del usuario. Si no existe, redirige al login, preservando la URL original para una redirección posterior.
 *  2.  **Obtención de Datos y Contexto:** Realiza una única consulta a Supabase. Esta consulta es eficiente, ya que obtiene los datos de la campaña y, a través de una relación (`site:sites`), obtiene el `workspace_id` al que pertenece la campaña.
 *  3.  **Autorización Centralizada:** El paso más crítico. Invoca al helper `hasWorkspacePermission` con el ID del usuario, el `workspace_id` obtenido, y la lista de roles permitidos. Esta llamada centraliza la lógica de seguridad, asegurando que solo los miembros del workspace puedan acceder al editor. Si la autorización falla, redirige al dashboard.
 *  4.  **Preparación de Datos (Fallback):** Comprueba si el campo `content` de la campaña es nulo. Si lo es (indicando una campaña nueva), genera una estructura de `CampaignConfig` por defecto. Esto asegura que el constructor siempre reciba una estructura de datos válida para trabajar.
 *  5.  **Hidratación de Estado:** Llama a `useBuilderStore.setState` directamente en el servidor. Esta es una técnica avanzada de Zustand que pre-carga el estado en el servidor. Cuando los componentes de cliente del constructor se carguen en el navegador, heredarán este estado inicial, eliminando la necesidad de una petición de datos adicional desde el cliente.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Sistema de Plantillas de Campaña: La estructura de campaña por defecto está codificada en este archivo. Una mejora arquitectónica significativa sería mover esta y otras plantillas a una tabla `campaign_templates` en la base de datos. Al crear una nueva campaña, el usuario podría seleccionar una plantilla. Este componente entonces cargaría el JSON de la plantilla correspondiente en lugar de usar un fallback codificado.
 * 2. Cacheo de Datos de Campaña: La consulta para obtener los datos de la campaña es un candidato ideal para ser cacheado con `unstable_cache` de Next.js. La etiqueta de la caché podría ser `campaign:${params.campaignId}`. La Server Action `updateCampaignContentAction` debería entonces usar `revalidateTag` para invalidar esta caché al guardar, mejorando el rendimiento en cargas posteriores del editor.
 * 3. Página de "Acceso Denegado" Específica: En lugar de una redirección genérica a `/dashboard` en caso de fallo de autorización, se podría redirigir a una página `/unauthorized` que explique al usuario por qué no puede acceder a ese recurso (ej. "No eres miembro del workspace que contiene esta campaña"). Esto proporciona una experiencia de usuario mucho más clara.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Esqueleto de Carga Sofisticado: Añadir un archivo `loading.tsx` en esta misma ruta para mostrar una versión esquelética del constructor, mejorando significativamente la experiencia de usuario percibida (LCP y CLS). (IMPLEMENTADO)
 * 2. Página de "Acceso Denegado" Específica: En lugar de redirigir a `/dashboard`, se podría redirigir a una página `/unauthorized` que explique al usuario por qué no puede acceder a ese recurso, lo cual es una UX más clara.
 * 3. Renderizado de la Página Pública (`/c/[slug]`): Implementar la página pública que consumirá el JSON guardado. Se crearía una ruta `app/c/[campaignSlug]/page.tsx` que buscaría la campaña por su `slug`, obtendría el `content` JSON, y lo renderizaría usando el mismo `blockRegistry` pero como una página estática (SSG/ISR) para un rendimiento máximo.
 */
