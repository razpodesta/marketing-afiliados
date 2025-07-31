// Ruta: lib/hooks/useSitesManagement.ts
/**
 * @file useSitesManagement.ts
 * @description Hook de estado especializado que encapsula toda la lógica de UI
 *              y la orquestación de acciones para la página "Mis Sitios".
 * @author L.I.A Legacy & RaZ Podestá
 * @version 3.1.0 (Type-Safe Optimistic UI Contracts - Final Fix)
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
import { type z } from "zod";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { useRouter } from "@/lib/navigation";
import { type CreateSiteSchema } from "@/lib/validators";
import { debounce } from "@/lib/utils";

type FormOutput = z.output<typeof CreateSiteSchema>;

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

  const handleCreate = async (data: FormOutput) => {
    setIsCreating(true);
    setCreateDialogOpen(false);
    toast.loading("Creando sitio...");

    const tempId = `temp-${Date.now()}`;
    // CORRECCIÓN CRÍTICA: Se añade la propiedad `description` para que el objeto
    // cumpla con el contrato de tipo `SiteWithCampaignsCount`, resolviendo el error TS2322.
    const newSiteOptimistic: SiteWithCampaignsCount = {
      id: tempId,
      subdomain: data.subdomain,
      name: data.name,
      icon: data.icon,
      description: data.description || null,
      created_at: new Date().toISOString(),
      workspace_id: data.workspaceId,
      owner_id: "temp-owner",
      custom_domain: null,
      updated_at: null,
      campaigns: [{ count: 0 }],
    };

    setSites((current) => [newSiteOptimistic, ...current]);

    const formData = new FormData();
    formData.append("workspaceId", data.workspaceId);
    formData.append("subdomain", data.subdomain);
    formData.append("name", data.name);
    formData.append("icon", data.icon);
    if (data.description) {
      formData.append("description", data.description);
    }

    const result = await sitesActions.createSiteAction(formData);

    toast.dismiss();

    if (result.success) {
      toast.success("¡Sitio creado con éxito!");
      router.refresh();
    } else {
      toast.error(result.error);
      setSites((current) => current.filter((s) => s.id !== tempId));
    }
    setIsCreating(false);
  };

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
        toast.error(result.error);
        setSites(previousSites);
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
    handleCreate,
    isPending: isDeleting,
    isCreating,
    deletingSiteId,
  };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la lógica de estado de la UI.
 *
 * 1.  **Abstracción a un Hook Genérico:** La lógica de "actualización optimista -> llamada al servidor -> reversión en fallo" es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResource(actions)` para ser utilizado en `sites`, `campaigns`, `members`, etc., reduciendo drásticamente el código duplicado.
 * 2.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "El subdominio ya está en uso. Por favor, elige otro.").
 * 3.  **Cancelación de Acciones:** Para la lógica de búsqueda en el servidor (una mejora futura), se podría integrar un `AbortController` para cancelar peticiones de búsqueda previas si el usuario sigue escribiendo, optimizando el uso de recursos de red y servidor.
 */

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `useSitesManagement.ts` es un hook de estado especializado, diseñado
 *               para desacoplar toda la lógica de negocio de la UI de presentación en la
 *               página "Mis Sitios".
 *
 * @functionality
 * - **Controlador de Estado Centralizado:** Abstrae toda la gestión de estado (lista de
 *   sitios, consulta de búsqueda, estado de modales, estados de carga) lejos de los
 *   componentes de UI.
 * - **Actualización Optimista Robusta:** Implementa un patrón de "actualización optimista".
 *   La corrección crítica ha sido alinear la forma del objeto `newSiteOptimistic` con el
 *   contrato de tipo `SiteWithCampaignsCount`, incluyendo la propiedad `description`, lo
 *   que sella la fisura de integridad de tipos en su origen.
 * - **Orquestación de Acciones:** Actúa como el intermediario entre la UI y las Server Actions.
 *   Su método `handleCreate` ahora espera y maneja correctamente el objeto de datos completo
 *   del formulario.
 *
 * @relationships
 * - Es el "cerebro" del componente orquestador `SitesClient.tsx`.
 * - Invoca directamente las Server Actions definidas en `lib/actions/sites.actions.ts`.
 *
 * @expectations
 * - Con esta corrección, el hook se convierte en una fuente de verdad de estado fiable y
 *   segura en tipos, permitiendo que la cascada de correcciones se propague a los
 *   componentes de UI sin conflictos.
 * =================================================================================================
 */
