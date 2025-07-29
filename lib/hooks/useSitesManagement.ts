/**
 * @file lib/hooks/useSitesManagement.ts
 * @description Hook personalizado para encapsular toda la lógica de gestión de la página "Mis Sitios".
 * @author L.I.A Legacy
 * @version 2.2.0 (Module Export Fix)
 */
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import toast from "react-hot-toast";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { debounce } from "@/lib/utils";
import type { CreateSiteFormState } from "@/lib/validators";
import { useRouter } from "@/navigation";

/**
 * @function useSitesManagement
 * @description Hook personalizado para gestionar el estado y las acciones de la página de sitios.
 *              Incluye funcionalidades de búsqueda, creación y exclusión optimista de sites.
 * @param {SiteWithCampaignsCount[]} initialSites - La lista inicial de sitios proporcionada por el servidor.
 * @returns {object} Un objeto conteniendo el estado y los manipuladores para la UI de sitios.
 */
// --- INICIO DE CORRECCIÓN ---
export function useSitesManagement(initialSites: SiteWithCampaignsCount[]) {
  // --- FIN DE CORRECCIÓN ---
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

  /**
   * @async
   * @function handleDelete
   * @description Manipulador para la exclusión de un sitio.
   *              Implementa la actualización optimista de la UI para una mejor experiencia del usuario.
   * @param {FormData} formData - Los datos del formulario que contiene el ID del sitio a ser excluido.
   */
  const handleDelete = (formData: FormData) => {
    const siteId = formData.get("siteId") as string;
    if (!siteId) return;

    const previousSites = sites;
    setSites((current) => current.filter((s) => s.id !== siteId));
    setDeletingSiteId(siteId);

    startDeleteTransition(async () => {
      const result = await sitesActions.deleteSiteAction(formData);
      if (result.success) {
        toast.success("Site excluído com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error || "Não foi possível excluir o site.");
        setSites(previousSites);
      }
      setDeletingSiteId(null);
    });
  };

  /**
   * @async
   * @function handleCreate
   * @description Manipulador para la creación de un nuevo sitio.
   *              Implementa la actualización optimista de la UI para una mejor experiencia del usuario.
   * @param {object} data - Los datos del nuevo sitio (subdominio e ícono).
   * @param {string} data.subdomain - El subdominio del nuevo sitio.
   * @param {string} data.icon - El ícono del nuevo sitio.
   */
  const handleCreate = async (data: { subdomain: string; icon: string }) => {
    setIsCreating(true);
    const tempId = `temp-${Date.now()}`;
    const newSiteOptimistic: SiteWithCampaignsCount = {
      id: tempId,
      subdomain: data.subdomain,
      icon: data.icon,
      created_at: new Date().toISOString(),
      workspace_id: "temp_workspace",
      owner_id: null,
      custom_domain: null,
      updated_at: null,
      campaigns: [{ count: 0 }],
    };

    setSites((current) => [newSiteOptimistic, ...current]);
    setCreateDialogOpen(false);
    toast.loading("Criando site...");

    const formData = new FormData();
    formData.append("subdomain", data.subdomain);
    formData.append("icon", data.icon);

    const result: CreateSiteFormState = await sitesActions.createSiteAction(
      {},
      formData
    );

    toast.dismiss();

    if (result.success) {
      toast.success("Site criado com sucesso!");
      router.refresh();
    } else {
      toast.error(result.error || "Não foi possível criar o site.");
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la gestión de sitios.
 *
 * 1.  **AbortController para Búsqueda en Servidor:** Si la búsqueda evoluciona para ser realizada en el servidor (para escalar a miles de sitios), este hook debería usar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario continúa escribiendo, optimizando el uso de recursos de red.
 * 2.  **Estado de Carga por Tarjeta Individual:** En lugar de un `deletingSiteId` global, se podría gestionar un `Map` o un objeto para los estados de carga individuales (`{ [siteId]: boolean }`). Esto permitiría que múltiples acciones de eliminación se ejecuten en paralelo visualmente sin bloquear toda la UI con un único estado `isPending`.
 * 3.  **Abstracción a Hook Genérico `useOptimisticState`:** El patrón de "guardar estado previo -> actualizar UI -> llamar a la acción -> revertir en caso de error" es reutilizable. Podría ser extraído a un hook genérico (`useOptimisticState`) para ser reutilizado en otras partes de la aplicación, como en la gestión de campañas, promoviendo el principio DRY (Don't Repeat Yourself).
 */
