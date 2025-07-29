// Ruta: app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para listar las campañas de un sitio específico.
 *              Este aparato es responsable de la seguridad, la obtención de datos
 *              y de pasar la información inicial a su componente de cliente.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.1.0 (Data Contract Fix)
 */
import { AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { BreadcrumbsProvider } from "@/lib/context/BreadcrumbsContext";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/lib/types/database";

import { CampaignsClient } from "./campaigns-client";

const CAMPAIGNS_PER_PAGE = 10;

/**
 * @async
 * @private
 * @function getPaginatedCampaignsBySiteId
 * @description Obtiene una lista paginada de campañas para un sitio específico.
 * @param {string} siteId - El UUID del sitio.
 * @param {{ page: number; limit: number }} options - Opciones de paginación.
 * @returns {Promise<{campaigns: Tables<"campaigns">[], totalCount: number}>}
 * @throws {Error} Si la consulta a la base de datos falla.
 */
async function getPaginatedCampaignsBySiteId(
  siteId: string,
  { page, limit }: { page: number; limit: number }
): Promise<{ campaigns: Tables<"campaigns">[]; totalCount: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // CORRECCIÓN CRÍTICA: La consulta ahora selecciona todos los campos ('*')
  // para que el tipo de dato devuelto coincida con el tipo `Tables<"campaigns">`
  // que el componente `CampaignsClient` espera.
  const { data, error, count } = await supabase
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.error(`Error al obtener campañas para el sitio ${siteId}:`, error);
    throw new Error("No se pudieron obtener las campañas.");
  }
  return { campaigns: data || [], totalCount: count || 0 };
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para optimizar y robustecer la obtención de datos de campañas.
 *
 * 1.  **Abstracción a Capa de Datos:** (Revalidado) La función `getPaginatedCampaignsBySiteId` reside actualmente en este archivo. Debería ser movida a su aparato correspondiente en la capa de datos (`lib/data/campaigns.ts`) para una separación de responsabilidades estricta.
 * 2.  **Optimización de la Consulta:** La consulta actual (`select("*")`) devuelve el campo `content`, que puede ser un JSON muy pesado e innecesario para la lista de campañas. La consulta en la capa de datos debería ser optimizada para seleccionar solo los campos necesarios para la tabla (`id`, `name`, `slug`, `updated_at`), mejorando significativamente el rendimiento.
 * 3.  **Cacheo de Datos en Servidor:** (Revalidado) La consulta de campañas paginadas es una candidata ideal para ser cacheada con `unstable_cache` de Next.js, con etiquetas (`tags`) que incluyan el `siteId` y el `page`. Las Server Actions que modifican campañas deberían invalidar esta caché con `revalidateTag` para mantener los datos frescos.
 */

/**
 * @fileoverview El aparato `campaigns/page.tsx` es el Server Component responsable de orquestar la página de gestión de campañas de un sitio.
 * @functionality
 * - **Seguridad:** Realiza una verificación de autenticación y autorización, asegurando que solo los miembros del workspace al que pertenece el sitio puedan ver sus campañas.
 * - **Obtención de Datos:** Llama a la capa de datos para obtener la lista paginada de campañas para el `siteId` especificado en la URL.
 * - **Gestión de Contexto:** Utiliza el `BreadcrumbsProvider` para pasar información contextual (el nombre del sitio) a los componentes de cliente, permitiendo una UI de navegación más rica.
 * - **Renderizado y Fallbacks:** Envuelve al componente de cliente `CampaignsClient`, pasándole los datos iniciales como props. Utiliza `Suspense` para manejar estados de carga y un `try/catch` para renderizar un estado de error si la obtención de datos falla.
 * @relationships
 * - Es una ruta dinámica dentro de `app/[locale]/dashboard/sites/`.
 * - Es el padre directo de `CampaignsClient`, actuando como su proveedor de datos del lado del servidor.
 * - Depende de `lib/data/campaigns.ts` (una vez refactorizado) para la lógica de acceso a datos.
 * - Depende de `lib/auth/user-permissions.ts` (implícitamente, a través de la lógica de autorización) para las comprobaciones de seguridad.
 * @expectations
 * - Se espera que este componente sea una barrera de seguridad robusta y un proveedor de datos eficiente. No debe contener lógica de UI interactiva, delegando esa responsabilidad completamente a `CampaignsClient`. Su código debe ser asíncrono y manejar todos los posibles estados (éxito, carga, error) de forma explícita.
 */
// Ruta: app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx
