// lib/hooks/useSitesManagement.ts
"use client";

import { sites as sitesActions } from "@/lib/actions";
import { type CreateSiteFormState } from "@/lib/actions/schemas";
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
 * @author L.I.A Legacy
 * @version 2.0.0 (Type-Safe Architecture)
 */
export function useSitesManagement(initialSites: SiteWithCampaignsCount[]) {
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


/* MEJORAS FUTURAS DETECTADAS
 * 1. AbortController para Búsqueda en Servidor: Si la búsqueda evoluciona para realizarse en el servidor, este hook debería usar un `AbortController` para cancelar las peticiones de búsqueda anteriores si el usuario sigue escribiendo, optimizando el uso de recursos.
 * 2. Estado de Carga por Tarjeta Individual: En lugar de un `deletingSiteId` global, se podría gestionar un `Map` o un objeto para los estados de carga individuales, permitiendo que múltiples acciones se ejecuten en paralelo sin bloquear toda la UI.
 * 3. Reversión de Estado más Robusta: El sistema de actualización optimista podría ser extraído a un hook genérico (`useOptimisticState`) para ser reutilizado en otras partes de la aplicación, como en la gestión de campañas.
 */
