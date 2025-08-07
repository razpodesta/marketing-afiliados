// app/[locale]/dashboard/sites/sites-client.tsx
/**
 * @file sites-client.tsx
 * @description Aparato Orquestador del Cliente. Corrigido para importar
 *              `PaginationControls` desde sua localização canônica.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 13.1.0 (Dependency Path Fix)
 */
"use client";

import { useFormatter, useTranslations } from "next-intl";

// --- INÍCIO DA CORREÇÃO DE IMPORTAÇÃO ---
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SitesGrid, SitesHeader } from "@/components/sites";
// --- FIM DA CORREÇÃO DE IMPORTAÇÃO ---
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
  const t = useTranslations("SitesPage");
  const tDialogs = useTranslations("Dialogs");
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
  } = useSitesManagement(
    initialSites,
    activeWorkspace?.id || "",
    t("entityName")
  );

  if (!activeWorkspace) {
    return null;
  }

  const texts = {
    header: {
      title: t("header_title"),
      description: t("header_description"),
      searchPlaceholder: t("search_placeholder"),
      clearSearchAria: t("clear_search_aria"),
      createSiteButton: t("createSite_button"),
      createDialogTitle: t("createSiteDialog_title"),
    },
    form: {
      nameLabel: t("form_name_label"),
      namePlaceholder: t("form_name_placeholder"),
      subdomainLabel: t("form_subdomain_label"),
      subdomainInUseError: t("subdomain_in_use_error"),
      descriptionLabel: t("form_description_label"),
      descriptionPlaceholder: t("form_description_placeholder"),
      creatingButton: t("form_creating_button"),
      createButton: t("form_create_button"),
    },
    grid: {
      emptyStateTitle: t("emptyState_title"),
      emptyStateDescription: t("emptyState_description"),
    },
    card: {
      campaignCount: (count: number) => t("campaignCount", { count }),
      manageCampaignsButton: t("manageCampaigns_button"),
      deleteSiteAriaLabel: (subdomain: string) =>
        t("delete_site_aria_label", { subdomain }),
      openSiteAriaLabel: t("open_site_aria_label"),
      popoverTitle: t("popover_title"),
      popoverDescription: t("popover_description"),
    },
    deleteDialog: {
      title: t("deleteDialog_title"),
      description: (subdomain: string) =>
        t.rich("deleteDialog_description", {
          subdomain,
          strong: (chunks) => <strong>{chunks}</strong>,
        }),
      confirmButton: t("deleteDialog_confirmButton"),
      cancelButton: tDialogs("generic_cancelButton"),
    },
    pagination: {
      previousPageLabel: t("pagination.previous"),
      nextPageLabel: t("pagination.next"),
      pageLabelTemplate: t("pagination.page"),
    },
  };

  return (
    <div className="space-y-6 relative">
      <SitesHeader
        texts={texts.header}
        formTexts={texts.form}
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
        texts={texts.grid}
        cardTexts={texts.card}
        deleteDialogTexts={texts.deleteDialog}
      />
      <PaginationControls
        page={page}
        totalCount={totalCount}
        limit={limit}
        basePath="/dashboard/sites"
        searchQuery={searchQuery}
        texts={texts.pagination}
      />
    </div>
  );
}
// app/[locale]/dashboard/sites/sites-client.tsx
