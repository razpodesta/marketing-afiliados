// lib/hooks/useSitesManagement.ts
/**
 * @file useSitesManagement.ts
 * @description Hook de estado especializado para la página "Mis Sitios".
 *              Refactorizado para una arquitectura de búsqueda en servidor.
 *              Ahora gestiona la navegación para iniciar nuevas búsquedas
 *              y mantiene la lógica de eliminación optimista.
 * @author L.I.A Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 5.0.0 (Server-Side Search Navigation)
 */
"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { sites as sitesActions } from "@/lib/actions";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { usePathname, useRouter } from "@/lib/navigation";
import { debounce } from "@/lib/utils";

/**
 * @function useSitesManagement
 * @description Hook que gestiona el estado y las interacciones para la lista de sitios.
 * @param {SiteWithCampaignsCount[]} initialSites - La lista inicial de sitios (ya filtrada) del servidor.
 * @returns {object} Un objeto con el estado y los manejadores necesarios para la UI.
 */
export function useSitesManagement(initialSites: SiteWithCampaignsCount[]) {
  const [sites, setSites] = useState<SiteWithCampaignsCount[]>(initialSites);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  const handleSearch = useCallback(
    debounce((query: string) => {
      const params = new URLSearchParams(window.location.search);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.delete("page");
      // @ts-ignore - pathname es del tipo AppPathname, compatible con el router
      router.push(`${pathname}?${params.toString()}`);
    }, 500),
    [pathname, router]
  );

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
        router.refresh();
      } else {
        toast.error(result.error);
        setSites(previousSites);
      }
      setDeletingSiteId(null);
    });
  };

  return {
    sites,
    isCreateDialogOpen,
    setCreateDialogOpen,
    handleDelete,
    isPending,
    deletingSiteId,
    handleSearch,
  };
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la lógica de estado de la UI de sitios.
 *
 * 1.  **Abstracción a un Hook Genérico**: (Vigente) La lógica de estado para `initial`, `optimistic update`, `server call`, `rollback` es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResourceManagement` para ser reutilizado en `sites`, `campaigns`, `members`, etc.
 * 2.  **Sincronización de URL sin Recarga Completa**: (Implementado parcialmente con `router.push`) Para una experiencia de SPA más fluida, se podría explorar el uso de `router.replace` en lugar de `router.push` para la búsqueda, de modo que no se añada al historial del navegador.
 * 3.  **Cancelación de Peticiones de Navegación**: (Vigente) Para una UX muy refinada, si el usuario escribe rápidamente, las navegaciones podrían cancelarse si una nueva es iniciada. Esto es un patrón avanzado que podría requerir lógica adicional.
 */
// lib/hooks/useSitesManagement.ts
