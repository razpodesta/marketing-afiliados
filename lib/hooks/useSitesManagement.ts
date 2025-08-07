// lib/hooks/useSitesManagement.ts
/**
 * @file useSitesManagement.ts
 * @description Hook de estado especializado para a página "Meus Sites".
 *              Refatorado para ser um hook de lógica pura, recebendo todas
 *              as dependências de texto (como `entityName`) do orquestrador.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 9.0.0 (Pure Logic Hook)
 */
"use client";

import { useCallback, useState } from "react";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { usePathname, useRouter } from "@/lib/navigation";
import { debounce } from "@/lib/utils";

import { useOptimisticResourceManagement } from "./useOptimisticResourceManagement";

export function useSitesManagement(
  initialSites: SiteWithCampaignsCount[],
  workspaceId: string,
  entityName: string // <-- Nova prop para internacionalização
) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    items: sites,
    isPending,
    mutatingId,
    handleCreate: genericHandleCreate,
    handleDelete: genericHandleDelete,
  } = useOptimisticResourceManagement<SiteWithCampaignsCount>({
    initialItems: initialSites,
    entityName, // <-- Passado para o hook genérico
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
      params.set("page", "1");
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
      id: `optimistic-${Date.now()}`,
      description: (formData.get("description") as string) || null,
      icon: "🌐",
      created_at: new Date().toISOString(),
      updated_at: null,
      owner_id: "optimistic-user",
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
      // O hook genérico espera a chave 'id'
      genericFormData.append("id", siteId as string);
      genericHandleDelete(genericFormData);
    }
  };

  return {
    sites,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    mutatingId,
    handleSearch,
    handleCreate,
    handleDelete,
  };
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Hook de Lógica Pura**: ((Implementada)) O hook não contém mais texto codificado em duro. A prop `entityName` é agora injetada, tornando o hook completamente reutilizável e agnóstico à apresentação.
 */
// lib/hooks/useSitesManagement.ts
