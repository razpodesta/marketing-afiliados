// app/[locale]/dashboard/sites/sites-client.tsx
"use client";

import { PaginationControls, SitesGrid, SitesHeader } from "@/components/sites";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

/**
 * @file sites-client.tsx
 * @description Componente orquestador de cliente para la página de "Mis Sitios".
 *              Ha sido refactorizado para consumir el contexto del dashboard y
 *              proveer el 'workspaceId' requerido a sus componentes hijos.
 * @author L.I.A Legacy
 * @version 8.1.0 (Context-Aware Prop Delegation)
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
  const {
    filteredSites,
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    handleCreate,
    isPending,
    isCreating,
    deletingSiteId,
  } = useSitesManagement(initialSites);

  // Guarda defensiva en caso de que el contexto no esté listo,
  // aunque el middleware debería prevenirlo.
  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmitCreate={handleCreate}
        isCreating={isCreating}
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
 * - **Orquestación de Estado y UI:** Utiliza el hook `useSitesManagement` para toda la lógica de estado
 *   (búsqueda, creación, eliminación) y pasa este estado y los manejadores de eventos a los
 *   componentes de presentación puros (`SitesHeader`, `SitesGrid`).
 * - **Conciencia de Contexto (Refactorización Clave):** La causa del error de build era que
 *   `SitesHeader` necesitaba saber en qué `workspaceId` se iba a crear un nuevo sitio, pero
 *   `SitesClient` no se lo proporcionaba. La refactorización introduce el uso del hook
 *   `useDashboard` para obtener el `activeWorkspace` del contexto global de la aplicación.
 * - **Delegación de Props:** Ahora, `SitesClient` cumple su función de orquestador al tomar
 *   el `activeWorkspace.id` del contexto y pasarlo como la prop `workspaceId` a `SitesHeader`,
 *   reparando el contrato de tipos y resolviendo el error de compilación.
 *
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/dashboard/sites/page.tsx`.
 * - Consume el contexto `DashboardContext` a través del hook `useDashboard`.
 * - Es el padre de `SitesHeader` y `SitesGrid`, actuando como su controlador.
 *
 * @expectations
 * - Se espera que este componente actúe como una capa de orquestación delgada y eficiente.
 *   Debe consumir datos del servidor (props) y del contexto global, y usarlos para
 *   configurar la lógica de estado (hooks) y los componentes de presentación (hijos),
 *   sin contener lógica de negocio compleja por sí mismo.
 * =================================================================================================
 */
