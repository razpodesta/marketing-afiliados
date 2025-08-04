// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
/**
 * @file campaigns-client.tsx
 * @description Componente orquestador para la gestión de campañas. Ha sido
 *              re-arquitecturizado para componer aparatos de UI atómicos,
 *              simplificando su lógica y mejorando su mantenibilidad.
 * @author L.I.A Legacy
 * @version 5.0.0
 */
"use client";

import { CampaignsHeader, CampaignsTable } from "@/components/campaigns";
import { PaginationControls } from "@/components/sites/PaginationControls";
import { Card } from "@/components/ui/card";
import { useCampaignsManagement } from "@/lib/hooks/useCampaignsManagement";
import type { Tables } from "@/lib/types/database";

type Campaign = Tables<"campaigns">;
type SiteInfo = { id: string; subdomain: string | null };

export function CampaignsClient({
  site,
  initialCampaigns,
  totalCount,
  page,
  limit,
}: {
  site: SiteInfo;
  initialCampaigns: Campaign[];
  totalCount: number;
  page: number;
  limit: number;
}) {
  const {
    campaigns,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    mutatingId,
    handleDelete,
    handleCreate,
  } = useCampaignsManagement(initialCampaigns, site.id);

  const isCreating =
    isPending && (mutatingId?.startsWith("optimistic-") ?? false);

  return (
    <div className="space-y-6 relative">
      <CampaignsHeader
        siteId={site.id}
        siteSubdomain={site.subdomain}
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        isCreating={isCreating}
        onCreate={handleCreate}
      />
      <Card>
        <CampaignsTable
          campaigns={campaigns}
          isPending={isPending}
          mutatingId={mutatingId}
          onDelete={handleDelete}
        />
      </Card>
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath="/dashboard/sites/[siteId]/campaigns"
        routeParams={{ siteId: site.id }}
      />
    </div>
  );
}
