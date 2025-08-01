// app/[locale]/dashboard/sites/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para "Mis Sitios". Corregida para exportar
 *              su componente de lógica para poder ser probado de forma aislada.
 * @author L.I.A Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 5.1.0 (Testability Export Fix)
 */
import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import { sites as sitesData } from "@/lib/data";
import { mockSites } from "@/lib/dev/mock-session";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

import { SitesClient } from "./sites-client";

const SITES_PER_PAGE = 9;

const SitesPageSkeleton = () => (
  <div className="space-y-6 relative animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="h-8 w-32 bg-muted rounded-md" />
        <div className="h-5 w-72 bg-muted rounded-md mt-2" />
      </div>
      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="h-10 w-full md:w-64 bg-muted rounded-md" />
        <div className="h-10 w-32 bg-muted rounded-md" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-40 bg-muted" />
      ))}
    </div>
  </div>
);

// CORRECCIÓN: Se exporta la función para que el test pueda importarla.
export async function SitesPageLoader({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  if (process.env.DEV_MODE_ENABLED === "true") {
    return (
      <SitesClient
        initialSites={mockSites}
        totalCount={mockSites.length}
        page={1}
        limit={SITES_PER_PAGE}
        searchQuery={searchParams.q || ""}
      />
    );
  }
  const cookieStore = cookies();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login?next=/dashboard/sites");

  const workspaceId = cookieStore.get("active_workspace_id")?.value;
  if (!workspaceId) {
    logger.warn(`Usuario ${user.id} accedió a /sites sin workspace activo.`);
    return redirect("/dashboard");
  }

  try {
    const page = Number(searchParams.page) || 1;
    const searchQuery = searchParams.q || "";
    const { sites, totalCount } = await sitesData.getSitesByWorkspaceId(
      workspaceId,
      { page, limit: SITES_PER_PAGE, query: searchQuery }
    );
    return (
      <SitesClient
        initialSites={sites}
        totalCount={totalCount}
        page={page}
        limit={SITES_PER_PAGE}
        searchQuery={searchQuery}
      />
    );
  } catch (error) {
    logger.error(
      `Error al cargar sitios para workspace ${workspaceId}:`,
      error
    );
    return (
      <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive-foreground">
          Error al Cargar Sitios
        </h2>
        <p className="text-muted-foreground mt-2">
          No se pudo obtener la información.
        </p>
      </Card>
    );
  }
}

export default async function SitesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  return (
    <Suspense fallback={<SitesPageSkeleton />}>
      <SitesPageLoader searchParams={searchParams} />
    </Suspense>
  );
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la página de gestión de sitios.
 *
 * 1.  **Cacheo de Datos del Servidor**: (Vigente) Envolver la llamada a `getSitesByWorkspaceId` con `unstable_cache` de Next.js, usando `page` y `q` como parte de la clave de caché, para mejorar el rendimiento en navegaciones repetidas. La caché se invalidaría con `revalidatePath` en las Server Actions.
 * 2.  **Esqueleto de Carga Específico**: (Implementado) Se ha creado un `SitesPageSkeleton` para mejorar la experiencia de usuario percibida (LCP y CLS) mientras se ejecutan las consultas asíncronas en este componente.
 * 3.  **Ordenamiento en Servidor**: (Vigente) Expandir la funcionalidad para aceptar `searchParams` de ordenamiento (ej. `?sort=name_asc`) y pasarlos a la capa de datos para que el ordenamiento se realice eficientemente en la base de datos.
 */
// app/[locale]/dashboard/sites/page.tsx
