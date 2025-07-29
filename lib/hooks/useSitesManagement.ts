// Ruta: lib/hooks/useSitesManagement.ts
/**
 * @file lib/hooks/useSitesManagement.ts
 * @description Hook de estado especializado que encapsula toda la lógica de UI
 *              y la orquestación de acciones para la página "Mis Sitios".
 *              Este aparato es el "cerebro" de la experiencia de gestión de sitios.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 2.2.5 (Definitive Linting Fix - Manual Verification Protocol)
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
import { useRouter } from "@/lib/navigation";
import { debounce } from "@/lib/utils";
import type { CreateSiteFormState } from "@/lib/validators";

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

  // CORRECCIÓN DEFINITIVA (react-hooks/exhaustive-deps): Se añade el array de dependencias
  // vacío. Esto es correcto porque ni `debounce` ni `setSearchQuery` cambian durante el
  // ciclo de vida del componente, garantizando que la función debounced se cree una sola vez.
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
        toast.success("Sitio excluido con éxito.");
      } else {
        toast.error(result.error || "No fue posible excluir el sitio.");
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
      workspace_id: "temp_workspace",
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
      toast.success("Sitio creado con éxito!");
      router.refresh();
    } else {
      toast.error(result.error || "No fue posible crear el sitio.");
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
/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `useSitesManagement` es un hook de estado especializado (Stateful Hook)
 *               que actúa como el "cerebro" para la página de "Mis Sitios".
 *
 * @functionality
 * - **Abstracción de Lógica:** Centraliza toda la lógica de estado y de interacción del usuario
 *   (búsqueda, apertura de modales, creación, eliminación) fuera del componente de presentación
 *   `SitesClient`. Esto adhiere al principio de Separación de Responsabilidades, haciendo que
 *   el componente de UI sea más simple y declarativo.
 * - **Actualizaciones Optimistas:** Implementa un patrón de "actualización optimista" tanto para
 *   la creación como para la eliminación. Esto significa que la UI se actualiza *instantáneamente*
 *   como si la operación del servidor ya hubiera tenido éxito. Esto proporciona una experiencia
 *   de usuario extremadamente rápida y fluida. Si la operación del servidor falla, el hook se
 *   encarga de "revertir" el cambio en la UI y notificar al usuario del error.
 * - **Optimización de Rendimiento:** Utiliza `debounce` en la función de búsqueda para prevenir
 *   que el estado se actualice y la lista se filtre en cada pulsación de tecla, ejecutando la
 *   lógica de filtrado solo cuando el usuario deja de escribir. `useMemo` y `useCallback` se
 *   utilizan para memoizar cálculos y funciones, previniendo re-renders innecesarios.
 *
 * @relationships
 * - Es consumido exclusivamente por `app/[locale]/dashboard/sites/sites-client.tsx`.
 * - Orquesta las llamadas a las Server Actions del namespace `sites` (`lib/actions/sites.actions.ts`).
 * - Depende de `lib/navigation.ts` para acceder al `router` y refrescar los datos del servidor.
 *
 * @expectations
 * - Se espera que este hook sea la única fuente de verdad para el estado de la página "Mis Sitios".
 *   Cualquier nueva funcionalidad interactiva para esta página (como ordenamiento, filtros avanzados, etc.)
 *   debe ser implementada aquí para mantener la cohesión y la mantenibilidad del código.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar la gestión de sitios.
 *
 * 1.  **AbortController para Búsqueda en Servidor:** Si la búsqueda evoluciona para ser realizada en el servidor (para escalar a miles de sitios), este hook debería usar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario continúa escribiendo, optimizando el uso de recursos de red.
 * 2.  **Estado de Carga por Tarjeta Individual:** En lugar de un `deletingSiteId` global, se podría gestionar un `Map` o un objeto para los estados de carga individuales (`{ [siteId]: boolean }`). Esto permitiría que múltiples acciones de eliminación se ejecuten en paralelo visualmente sin bloquear toda la UI con un único estado `isPending`.
 * 3.  **Abstracción a Hook Genérico `useOptimisticResourceManagement`:** El patrón de "guardar estado previo -> actualizar UI -> llamar a la acción -> revertir en caso de error" es reutilizable. Podría ser extraído a un hook genérico (`useOptimisticState`) para ser reutilizado en otras partes de la aplicación, como en la gestión de campañas, promoviendo el principio DRY (Don't Repeat Yourself).
 */
// Ruta: lib/hooks/useSitesManagement.ts
