// app/[locale]/dashboard/sites/sites-client.tsx
"use client";

import { PaginationControls, SitesGrid, SitesHeader } from "@/components/sites";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

/**
 * @file sites-client.tsx
 * @description Componente orquestador de cliente para la página de "Mis Sitios".
 *              Ha sido refactorizado para alinearse con la nueva API simplificada
 *              del hook `useSitesManagement`.
 * @author L.I.A Legacy
 * @version 9.0.0 (Hook API Alignment)
 */
interface SitesClientProps {
  initialSites: SiteWithCampaignsCount[];
  totalCount: number;
  page: number;
  limit: number;
}

export function SitesClient({
  initialSites,
  totalCount,
  page,
  limit,
}: SitesClientProps) {
  const { activeWorkspace } = useDashboard();

  // CORRECCIÓN: Se eliminan `handleCreate` y `isCreating` de la deconstrucción
  // ya que el hook ya no los proporciona.
  const {
    filteredSites,
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    deletingSiteId,
  } = useSitesManagement(initialSites);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      {/* CORRECCIÓN: Se eliminan las props `onSubmitCreate` y `isCreating` */}
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        workspaceId={activeWorkspace.id}
      />
      <SitesGrid
        sites={filteredSites}
        onDelete={handleDelete}
        isPending={isPending}
        deletingSiteId={deletingSiteId}
      />
      {!searchQuery && (
        <PaginationControls
          page={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/dashboard/sites"
        />
      )}
    </div>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `SitesClient` es el orquestador principal de la página "Mis Sitios".
 *
 * @functionality
 * - **Orquestación de Estado y UI:** Utiliza el hook `useSitesManagement` para toda la lógica de
 *   estado (búsqueda, eliminación) y pasa este estado y los manejadores de eventos a los
 *   componentes de presentación puros (`SitesHeader`, `SitesGrid`).
 * - **Alineación de Contrato (Refactorización Clave):** La refactorización ha consistido en
 *   actualizar la deconstrucción del hook `useSitesManagement` y las props pasadas a `SitesHeader`
 *   para reflejar la nueva arquitectura cohesiva. Esto resuelve los errores de tipo `TS2339`.
 *
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/dashboard/sites/page.tsx`.
 * - Consume el contexto `DashboardContext` a través del hook `useDashboard`.
 * - Es el padre de `SitesHeader` y `SitesGrid`, actuando como su controlador.
 *
 * @expectations
 * - Se espera que este componente actúe como una capa de orquestación delgada y eficiente,
 *   conectando la lógica de estado del hook con los componentes de presentación.
 * =================================================================================================
 */