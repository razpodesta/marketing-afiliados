// Ruta: lib/hooks/useSitesManagement.ts
"use client";

import { sites as sitesActions } from "@/app/actions";
import type { CreateSiteFormState } from "@/app/actions/schemas";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { debounce } from "@/lib/utils";
import { useRouter } from "@/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import toast from "react-hot-toast";

/**
 * @file useSitesManagement.ts
 * @description Hook personalizado para encapsular toda la lógica de gestión de la página "Mis Sitios".
 * REFACTORIZACIÓN DE ESTABILIDAD:
 * 1.  Se ha añadido tipado explícito `useState<SiteWithCampaignsCount[]>` para prevenir
 *     la inferencia de tipo 'never' por parte de TypeScript.
 *
 * @author L.I.A Legacy
 * @version 1.1.0 (Type Stability Patch)
 */
export function useSitesManagement(initialSites: SiteWithCampaignsCount[]) {
  // CORRECCIÓN: Se añade el tipo explícito para el estado.
  const [sites, setSites] = useState<SiteWithCampaignsCount[]>(initialSites);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  const debouncedSetSearchQuery = useCallback(
    debounce(setSearchQuery, 300),
    []
  );

  const filteredSites = useMemo(() => {
    if (!searchQuery) return sites;
    return sites.filter((site) =>
      site.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sites, searchQuery]);

  const handleDelete = (formData: FormData) => {
    const siteId = formData.get("siteId") as string;
    if (!siteId) return;

    const previousSites = sites;
    setSites((current) => current.filter((s) => s.id !== siteId));
    setDeletingSiteId(siteId);

    startDeleteTransition(async () => {
      const result = await sitesActions.deleteSiteAction(formData);
      if (result.success) {
        toast.success("Sitio eliminado con éxito.");
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo eliminar el sitio.");
        setSites(previousSites);
      }
      setDeletingSiteId(null);
    });
  };

  const handleCreate = async (data: { subdomain: string; icon: string }) => {
    setIsCreating(true);
    const tempId = `temp-${Date.now()}`;
    // CORRECCIÓN: El objeto optimista ahora incluye todas las propiedades del tipo.
    const newSiteOptimistic: SiteWithCampaignsCount = {
      id: tempId,
      subdomain: data.subdomain,
      icon: data.icon,
      created_at: new Date().toISOString(),
      workspace_id: "temp_workspace", // Valor temporal, no relevante para la UI
      owner_id: null,
      custom_domain: null,
      updated_at: null,
      campaigns: [{ count: 0 }],
    };

    setSites((current) => [newSiteOptimistic, ...current]);
    setCreateDialogOpen(false);
    toast.loading("Creando sitio...");

    const formData = new FormData();
    formData.append("subdomain", data.subdomain);
    formData.append("icon", data.icon);

    const result: CreateSiteFormState = await sitesActions.createSiteAction(
      {},
      formData
    );

    toast.dismiss();

    if (result.success) {
      toast.success("¡Sitio creado exitosamente!");
      router.refresh();
    } else {
      toast.error(result.error || "No se pudo crear el sitio.");
      setSites((current) => current.filter((s) => s.id !== tempId));
    }
    setIsCreating(false);
  };

  return {
    filteredSites,
    searchQuery,
    setSearchQuery: debouncedSetSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    handleCreate,
    isPending: isDeleting,
    isCreating,
    deletingSiteId,
  };
}
