// Ruta: lib/hooks/useSitesManagement.ts
/**
 * @file useSitesManagement.ts
 * @description Hook de estado especializado que encapsula la lógica de UI
 *              y la orquestación de acciones para la página "Mis Sitios".
 * @author L.I.A Legacy & RaZ Podestá
 * @version 4.0.0 (Simplified Responsibility & High Cohesion)
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

/**
 * @function useSitesManagement
 * @description Hook que gestiona el estado y las interacciones para la lista de sitios.
 * @param {SiteWithCampaignsCount[]} initialSites - La lista inicial de sitios cargada desde el servidor.
 * @returns {object} Un objeto que contiene el estado y los manejadores necesarios para la UI.
 */
export function useSitesManagement(initialSites: SiteWithCampaignsCount[]) {
  const [sites, setSites] = useState<SiteWithCampaignsCount[]>(initialSites);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => setSearchQuery(query), 300),
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

    startTransition(async () => {
      const result = await sitesActions.deleteSiteAction(formData);
      if (result.success) {
        toast.success("Sitio eliminado con éxito.");
        router.refresh(); // Refrescar para obtener la lista actualizada del servidor.
      } else {
        toast.error(result.error);
        setSites(previousSites); // Revertir en caso de error.
      }
      setDeletingSiteId(null);
    });
  };

  return {
    filteredSites,
    searchQuery,
    setSearchQuery: debouncedSetSearchQuery,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    deletingSiteId,
  };
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `useSitesManagement.ts` es un hook de estado especializado que
 *               ha sido refactorizado para una máxima cohesión.
 *
 * @functionality
 * - **Responsabilidad Única:** Su única responsabilidad ahora es gestionar el estado de la *lista*
 *   de sitios y el estado del diálogo de creación.
 * - **Lógica Simplificada:** Se ha eliminado toda la lógica de creación (`handleCreate`, `isCreating`).
 *   Esta responsabilidad se ha movido al componente `CreateSiteForm`, donde pertenece. Esto hace
 *   que el hook sea más simple, más reutilizable y más fácil de probar.
 * - **Flujo de Datos:** El hook sigue proporcionando la lógica de eliminación optimista y la
 *   funcionalidad de búsqueda con debounce, actuando como el "cerebro" para la visualización
 *   de la colección de sitios.
 *
 * @relationships
 * - Es consumido exclusivamente por el componente orquestador `SitesClient.tsx`.
 * - Sigue invocando `sitesActions.deleteSiteAction` para la eliminación.
 * - Ya no interactúa directamente con la lógica de creación de sitios.
 *
 * @expectations
 * - Se espera que este hook sea una fuente de verdad magra y eficiente para el estado de la UI
 *   de la colección de sitios. Su API simplificada ahora presenta un contrato claro y correcto
 *   para su consumidor, `SitesClient`.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la lógica de estado de la UI.
 *
 * 1.  **Abstracción a un Hook Genérico:** La lógica de "actualización optimista -> llamada al servidor -> reversión en fallo" es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResource(actions)` para ser utilizado en `sites`, `campaigns`, `members`, etc., reduciendo drásticamente el código duplicado.
 * 2.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario.
 * 3.  **Cancelación de Acciones:** Para la lógica de búsqueda en el servidor (una mejora futura), se podría integrar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo.
 */
