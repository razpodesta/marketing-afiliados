// app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx
/**
 * @file page.tsx
 * @description Contenedor de Servidor para la gestión de campañas. Ha sido refactorizado
 *              para soportar la búsqueda en servidor, abstraer la lógica de datos y
 *              simplificar su rol a la orquestación de seguridad y datos.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.0.0 (Server-Side Search & Data Abstraction)
 */
import { AlertTriangle } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { requireSitePermission } from "@/lib/auth/user-permissions";
import { BreadcrumbsProvider } from "@/lib/context/BreadcrumbsContext";
// --- REFACTORIZACIÓN ARQUITECTÓNICA ---
// Se importa el namespace completo de la capa de datos.
import { campaigns as campaignsData } from "@/lib/data";
// --- FIN DE REFACTORIZACIÓN ---
import { logger } from "@/lib/logging";

import { CampaignsClient } from "./campaigns-client";
import { CampaignsPageSkeleton } from "./loading";

const CAMPAIGNS_PER_PAGE = 10;

async function CampaignsPageLoader({
  params,
  searchParams,
}: {
  params: { siteId: string };
  searchParams: { page?: string; q?: string };
}) {
  const permissionCheck = await requireSitePermission(params.siteId, [
    "owner",
    "admin",
    "member",
  ]);

  if (!permissionCheck.success) {
    const redirectPath =
      permissionCheck.error === "SESSION_NOT_FOUND"
        ? `/login?next=/dashboard/sites/${params.siteId}/campaigns`
        : "/dashboard/sites";
    return redirect(redirectPath);
  }

  const { site } = permissionCheck.data;

  try {
    const page = Number(searchParams.page) || 1;
    const searchQuery = searchParams.q || "";

    // --- REFACTORIZACIÓN ARQUITECTÓNICA ---
    // La lógica de obtención de datos ahora está completamente abstraída.
    // Se pasa el `searchQuery` a la capa de datos para el filtrado en servidor.
    const { campaigns, totalCount } =
      await campaignsData.getCampaignsMetadataBySiteId(params.siteId, {
        page,
        limit: CAMPAIGNS_PER_PAGE,
        query: searchQuery,
      });
    // --- FIN DE REFACTORIZACIÓN ---

    return (
      <BreadcrumbsProvider nameMap={{ [site.id]: site.subdomain || "Sitio" }}>
        <CampaignsClient
          site={{ id: site.id, subdomain: site.subdomain }}
          initialCampaigns={campaigns}
          totalCount={totalCount}
          page={page}
          limit={CAMPAIGNS_PER_PAGE}
          searchQuery={searchQuery}
        />
      </BreadcrumbsProvider>
    );
  } catch (error) {
    logger.error("Error al cargar las campañas:", error);
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar las Campañas
        </h2>
        <p className="text-muted-foreground mt-2">
          No pudimos obtener la información. Por favor, intenta de nuevo.
        </p>
      </Card>
    );
  }
}

export default function CampaignsPage({
  params,
  searchParams,
}: {
  params: { siteId: string };
  searchParams: { page?: string; q?: string };
}) {
  return (
    <Suspense fallback={<CampaignsPageSkeleton />}>
      <CampaignsPageLoader params={params} searchParams={searchParams} />
    </Suspense>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Búsqueda en Servidor**: ((Implementada)) El componente ahora lee el parámetro `q` de la URL y lo pasa a la capa de datos, habilitando el filtrado del lado del servidor.
 * 2. **Abstracción de Datos y Seguridad**: ((Implementada)) Se ha movido la lógica de seguridad a `requireSitePermission` y la lógica de datos a `lib/data/campaigns.ts`, simplificando drásticamente el componente y adhiriéndose al patrón de Contenedor de Servidor canónico.
 * 3. **Arquitectura con `<Suspense>`**: ((Implementada)) Se ha introducido un componente `CampaignsPageLoader` y se ha envuelto en `<Suspense>`, creando una experiencia de carga de UI de élite.
 *
 * @subsection Melhorias Futuras
 * 1. **Internacionalización de Errores**: ((Vigente)) El mensaje de error renderizado en el `catch` está codificado en duro. Debería obtenerse desde `getTranslations`.
 */
// app/[locale]/dashboard/sites/[siteId]/campaigns/page.tsx
