// app/[locale]/dashboard/sites/sites-page-loader.tsx
/**
 * @file sites-page-loader.tsx
 * @description Componente de servidor aislado que encapsula toda la lógica de carga de
 *              datos para la página "Mis Sitios". Esta abstracción permite probar la
 *              lógica de forma independiente y mantiene el `page.tsx` limpio y
 *              conforme al contrato de Next.js.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Structural Refactoring)
 * @see {@link file://./page.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la lógica de carga de sitios.
 *
 * 1.  **Cacheo de Datos del Servidor**: (Vigente) Envolver la llamada a `getSitesByWorkspaceId` con `unstable_cache` de Next.js.
 * 2.  **Ordenamiento en Servidor**: (Vigente) Expandir la funcionalidad para aceptar `searchParams` de ordenamiento y pasarlos a la capa de datos.
 */
import { AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { sites as sitesData } from "@/lib/data";
import { mockSites } from "@/lib/dev/mock-session";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

import { SitesClient } from "./sites-client";

const SITES_PER_PAGE = 9;

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
// app/[locale]/dashboard/sites/sites-page-loader.tsx
