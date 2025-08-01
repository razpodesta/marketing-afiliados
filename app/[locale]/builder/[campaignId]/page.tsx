// Ruta: app/[locale]/builder/[campaignId]/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor principal del constructor para una campaña específica.
 *              Este aparato actúa como la capa de seguridad y obtención de datos,
 *              preparando e hidratando el estado inicial para la UI del cliente.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.1.0 (Data Layer Import Fix)
 */
import { notFound, redirect } from "next/navigation";
import { unstable_cache as cache } from "next/cache"; // Importar para futura mejora de caché

import { useBuilderStore } from "@/app/[locale]/builder/core/store";
import { Canvas } from "@/components/builder/Canvas";
import type { CampaignConfig } from "@/lib/builder/types.d";
import { campaigns as campaignsData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

// Futura mejora: función auxiliar para obtener datos de campaña con caché
// const getCampaignDataWithCache = (campaignId: string, userId: string) =>
//   cache(
//     async () => {
//       logger.info(`[Cache] MISS: Buscando campaña ${campaignId} para el constructor.`);
//       return campaignsData.getCampaignContentById(campaignId, userId);
//     },
//     [`campaign-builder-${campaignId}-${userId}`], // Clave de caché única por campaña y usuario
//     { tags: [`campaign:${campaignId}`] } // Tag para invalidación por Server Actions
//   );

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
    // Redirige al login, preservando la URL original para un retorno posterior.
    return redirect(`/login?next=/builder/${params.campaignId}`);
  }

  let campaignData;
  try {
    // Se utiliza el namespace correcto de la capa de datos.
    // Futura mejora: usar getCampaignDataWithCache(params.campaignId, user.id);
    campaignData = await campaignsData.getCampaignContentById(
      params.campaignId,
      user.id
    );
  } catch (error) {
    // MEJORA FUTURA (1): Manejo de errores de red/DB.
    logger.error(
      `Error al cargar la campaña ${params.campaignId} desde la base de datos:`,
      error
    );
    // Podríamos renderizar un componente de error más amigable aquí.
    // Por ahora, lanzamos notFound para un fallback genérico.
    return notFound();
  }

  if (!campaignData) {
    // Esto significa que la campaña no fue encontrada o el usuario no tiene permisos.
    logger.error(
      `Campaña no encontrada o acceso denegado para ${params.campaignId} por usuario ${user.id}`
    );
    // MEJORA FUTURA (3): Redirigir a una página de "acceso denegado" específica.
    return notFound();
  }

  // La lógica de fallback para el contenido de la campaña permanece sin cambios.
  // Esto asegura que una campaña recién creada (sin 'content') tenga una estructura base.
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

  // Hidratación del estado del cliente en el servidor.
  // Esto pre-carga el store de Zustand con los datos de la campaña antes de que el componente cliente se renderice.
  useBuilderStore.setState({ campaignConfig });

  return (
    <div className="h-full w-full bg-background p-4 relative">
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white shadow-inner">
        <Canvas /> {/* El componente Canvas leerá el estado del store */}
      </div>
    </div>
  );
}

/**
 * @fileoverview El aparato `builder/[campaignId]/page.tsx` es un componente de servidor crucial que actúa como la puerta de entrada al editor de campañas.
 * @functionality
 * - **Seguridad:** Es la primera línea de defensa. Valida la sesión del usuario y, a través de la capa de datos (`getCampaignContentById`), verifica que el usuario tiene los permisos necesarios para editar la campaña solicitada. Si no está autenticado o no tiene permisos, redirige o lanza un 404.
 * - **Obtención de Datos:** Obtiene la configuración completa de la campaña (`CampaignConfig`) desde la base de datos. Este proceso es optimizado con la delegación a la capa de datos.
 * - **Lógica de Fallback:** Si una campaña es nueva y no tiene contenido (`content` es nulo), este aparato genera una estructura de bloques por defecto para que el usuario no empiece con un lienzo completamente en blanco.
 * - **Hidratación de Estado:** Utiliza una técnica avanzada de Zustand (`setState` en el servidor) para pre-cargar el estado de la campaña en el servidor. Cuando los componentes de cliente del constructor se cargan en el navegador, heredan este estado inicial, eliminando la necesidad de una petición de datos adicional desde el cliente y mejorando el rendimiento de carga percibido.
 * @relationships
 * - Es el componente padre de `builder/[campaignId]/layout.tsx`, que a su vez contiene el `Canvas`.
 * - Depende directamente de la capa de datos, específicamente de `lib/data/campaigns.ts` para obtener la información de la campaña.
 * - Es responsable de inicializar el estado del store de Zustand definido en `lib/builder/core/store.ts`.
 * - Utiliza `next/navigation` (`redirect`, `notFound`) para la gestión del flujo de autenticación y de datos no encontrados.
 * @expectations
 * - Se espera que este componente sea una capa de preparación de datos segura y eficiente. Debe manejar todos los casos (usuario no autenticado, sin permisos, campaña no encontrada, errores de carga de datos) y asegurar que el store de cliente siempre se inicialice con un estado válido y consistente. Su código debe ser asíncrono y centrado en la lógica de servidor.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Cacheo de Datos de Campaña con `unstable_cache`:** La consulta para obtener los datos de la campaña es un candidato ideal para ser cacheado con `unstable_cache` de Next.js. La etiqueta de la caché podría ser `campaign:${params.campaignId}`. La Server Action `updateCampaignContentAction` debería entonces usar `revalidateTag` para invalidar esta caché al guardar, mejorando el rendimiento en cargas posteriores del editor.
 * 2.  **Manejo de Errores de Carga con UI Específica:** En lugar de lanzar un genérico `notFound()` o dejar que la página falle silenciosamente si `getCampaignContentById` lanza un error de red o base de datos, se podría envolver la llamada en un `try/catch` y renderizar un componente de error de React (`<ErrorComponent />`) con un mensaje más amigable y la opción de reintentar.
 * 3.  **Página de "Acceso Denegado" Específica:** En lugar de una redirección genérica a `notFound()` en caso de fallo de autorización o campaña no encontrada, se podría redirigir a una página `/unauthorized` que explique al usuario por qué no puede acceder a ese recurso (ej. "No eres miembro del workspace que contiene esta campaña", o "La campaña solicitada no existe"). Esto proporciona una experiencia de usuario mucho más clara.
 * 4.  **Sistema de Plantillas de Campaña Dinámico:** La estructura de campaña por defecto (`blocks` iniciales) está codificada. Una mejora arquitectónica significativa sería mover esta y otras plantillas a una tabla `campaign_templates` en la base de datos. Al crear una nueva campaña, el usuario podría seleccionar una plantilla. Este componente entonces cargaría el JSON de la plantilla correspondiente en lugar de usar un fallback codificado.
 */
