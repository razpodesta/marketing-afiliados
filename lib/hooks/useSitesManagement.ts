// lib/hooks/useSitesManagement.ts
/**
 * @file useSitesManagement.ts
 * @description Hook de estado especializado para la página "Mis Sitios".
 *              Ha sido refactorizado para utilizar el hook genérico reutilizable
 *              `useOptimisticResourceManagement`, unificando la lógica de creación
 *              y eliminación en un único patrón arquitectónico.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 8.0.0 (Atomic Architecture Refactor)
 * @see {@link file://./useOptimisticResourceManagement.ts} Para la lógica de negocio subyacente.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { usePathname, useRouter } from "@/lib/navigation";
import { debounce } from "@/lib/utils";
import { useOptimisticResourceManagement } from "./useOptimisticResourceManagement";

export function useSitesManagement(
  initialSites: SiteWithCampaignsCount[],
  workspaceId: string
) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  const {
    items: sites,
    isPending,
    mutatingId,
    handleCreate: genericHandleCreate,
    handleDelete: genericHandleDelete,
  } = useOptimisticResourceManagement<SiteWithCampaignsCount>({
    initialItems: initialSites,
    entityName: "Sitio",
    createAction: sitesActions.createSiteAction,
    deleteAction: sitesActions.deleteSiteAction,
  });

  const handleSearch = useCallback(
    debounce((query: string) => {
      const params = new URLSearchParams(window.location.search);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.delete("page"); // Reset page on new search
      router.push(`${pathname}?${params.toString()}` as any);
    }, 500),
    [pathname, router]
  );

  const handleCreate = (formData: FormData) => {
    const name = formData.get("name") as string;
    const subdomain = formData.get("subdomain") as string;

    const optimisticSite = {
      name,
      subdomain,
      workspace_id: workspaceId,
      // Proporcionar valores por defecto para el estado optimista
      id: `optimistic-${Date.now()}`,
      description: (formData.get("description") as string) || null,
      icon: "🌐",
      created_at: new Date().toISOString(),
      updated_at: null,
      owner_id: "optimistic-user", // Placeholder
      custom_domain: null,
      campaigns: [{ count: 0 }],
    };

    genericHandleCreate(formData, optimisticSite);
    setCreateDialogOpen(false);
  };

  const handleDelete = (formData: FormData) => {
    const siteId = formData.get("siteId");
    if (siteId) {
      const genericFormData = new FormData();
      genericFormData.append("id", siteId as string);
      genericHandleDelete(genericFormData);
    }
  };
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

  return {
    sites,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    // Renombrado para consistencia semántica
    mutatingId,
    handleSearch,
    handleCreate,
    handleDelete,
  };
}
