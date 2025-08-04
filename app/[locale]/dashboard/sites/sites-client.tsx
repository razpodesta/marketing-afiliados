// app/[locale]/dashboard/sites/sites-client.tsx
/**
 * @file sites-client.tsx
 * @description Aparato Orquestador del Cliente para la página "Mis Sitios".
 *              Compone los aparatos atómicos de UI y los conecta con la
 *              lógica del hook `useSitesManagement`.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 12.0.0
 */
"use client";

import { PaginationControls, SitesGrid, SitesHeader } from "@/components/sites";
import { useDashboard } from "@/lib/context/DashboardContext";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useSitesManagement } from "@/lib/hooks/useSitesManagement";

interface SitesClientProps {
  initialSites: SiteWithCampaignsCount[];
  totalCount: number;
  page: number;
  limit: number;
  searchQuery: string;
}

export function SitesClient({
  initialSites,
  totalCount,
  page,
  limit,
  searchQuery,
}: SitesClientProps) {
  const { activeWorkspace } = useDashboard();
  const {
    sites,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    mutatingId,
    handleSearch,
    handleCreate,
  } = useSitesManagement(initialSites, activeWorkspace?.id || "");

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        workspaceId={activeWorkspace.id}
        onCreate={handleCreate}
        isPending={isPending}
      />
      <SitesGrid
        sites={sites}
        onDelete={handleDelete}
        isPending={isPending}
        deletingSiteId={mutatingId}
      />
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath="/dashboard/sites"
        searchQuery={searchQuery}
      />
    </div>
  );
}
