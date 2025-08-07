// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
/**
 * @file campaigns-client.tsx
 * @description Orquestador de Cliente de élite para la gestión de campañas.
 *              Este aparato ha sido completamente atomizado. Su única responsabilidad
 *              es gestionar el estado y componer aparatos de presentación puros.
 * @author L.I.A Legacy
 * @version 7.0.0 (Fully Atomized)
 */
"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { CampaignsPageHeader } from "@/components/campaigns/CampaignsPageHeader";
import { getCampaignsColumns } from "@/components/campaigns/CampaignsTableColumns";
import { DataTable } from "@/components/shared/DataTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SearchToolbar } from "@/components/shared/SearchToolbar";
import { campaigns as campaignActions } from "@/lib/actions";
import { type CampaignMetadata } from "@/lib/data/campaigns";
import { useOptimisticResourceManagement } from "@/lib/hooks/useOptimisticResourceManagement";
import { usePathname, useRouter } from "@/lib/navigation";

type Campaign = CampaignMetadata;
type SiteInfo = { id: string; subdomain: string | null };

export function CampaignsClient({
  site,
  initialCampaigns,
  totalCount,
  page,
  limit,
  searchQuery,
}: {
  site: SiteInfo;
  initialCampaigns: Campaign[];
  totalCount: number;
  page: number;
  limit: number;
  searchQuery: string;
}) {
  const t = useTranslations("CampaignsPage");
  const tDialogs = useTranslations("Dialogs");
  const format = useFormatter();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    items: campaigns,
    isPending,
    mutatingId,
    handleCreate: genericHandleCreate,
    handleDelete: genericHandleDelete,
  } = useOptimisticResourceManagement<Campaign>({
    initialItems: initialCampaigns,
    entityName: t("entityName"),
    createAction: campaignActions.createCampaignAction,
    deleteAction: campaignActions.deleteCampaignAction,
  });

  const handleCreate = (formData: FormData) => {
    const name = formData.get("name") as string;
    if (!name) return;
    const optimisticCampaign = {
      name,
      site_id: site.id,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      affiliate_url: null,
    };
    genericHandleCreate(formData, optimisticCampaign);
    setCreateDialogOpen(false);
  };

  const handleDelete = (formData: FormData) => {
    const campaignId = formData.get("campaignId");
    if (campaignId) {
      const genericFormData = new FormData();
      genericFormData.append("id", campaignId as string);
      genericHandleDelete(genericFormData);
    }
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}` as any);
  };

  const columns = useMemo(
    () =>
      getCampaignsColumns({
        t,
        tDialogs,
        format,
        handleDelete,
        isPending,
        mutatingId,
      }),
    [t, tDialogs, format, handleDelete, isPending, mutatingId]
  );

  return (
    <div className="space-y-6 relative">
      <CampaignsPageHeader
        t={t}
        site={site}
        isCreateDialogOpen={isCreateDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        handleCreate={handleCreate}
        isPending={isPending}
        mutatingId={mutatingId}
      />
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        texts={{
          placeholder: t("search.placeholder"),
          clearSearchLabel: t("search.clear_aria"),
        }}
      />
      <DataTable
        columns={columns}
        data={campaigns}
        noResultsText={t("table.empty_state")}
      />
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath={pathname}
        routeParams={{ siteId: site.id }}
        searchQuery={searchQuery}
        texts={{
          previousPageLabel: t("pagination.previous"),
          nextPageLabel: t("pagination.next"),
          pageLabelTemplate: t("pagination.page"),
        }}
      />
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Totalmente Atómico**: ((Implementada)) El componente ahora es un orquestador puro. Su JSX es una composición limpia de otros aparatos atómicos, adhiriéndose a nuestra filosofía de diseño.
 */
// app/[locale]/dashboard/sites/[siteId]/campaigns/campaigns-client.tsx
