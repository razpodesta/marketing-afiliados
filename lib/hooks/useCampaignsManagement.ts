/**
 * @file lib/hooks/useCampaignsManagement.ts
 * @description Hook personalizado para encapsular toda la lógica de estado y
 *              acciones de la página de gestión de campañas.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.1.0 (Architectural Path Correction)
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

// CORRECCIÓN: La ruta de importación ahora apunta al barrel file `index.ts` de las acciones,
// que exporta todo bajo namespaces, alineándose con la arquitectura del proyecto.
import { campaigns as campaignActions } from "@/lib/actions";
// CORRECCIÓN: Con el `tsconfig.json` reparado, esta importación ahora se resuelve correctamente.
import { useRouter } from "@/lib/navigation";
import type { Tables } from "@/lib/types/database";

type Campaign = Tables<"campaigns">;

/**
 * @function useCampaignsManagement
 * @description Hook que gestiona el estado y las interacciones para la lista de campañas.
 *              Proporciona actualizaciones optimistas para la exclusión y maneja la
 *              comunicación con las Server Actions.
 * @param {Campaign[]} initialCampaigns - La lista inicial de campañas del servidor.
 * @returns {object} Un objeto con el estado y los manejadores para la UI.
 */
export function useCampaignsManagement(initialCampaigns: Campaign[]) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  const handleDelete = (formData: FormData) => {
    const campaignId = formData.get("campaignId") as string;
    if (!campaignId) return;

    const previousCampaigns = campaigns;
    setCampaigns((current) => current.filter((c) => c.id !== campaignId));
    setDeletingId(campaignId);

    startTransition(async () => {
      const result = await campaignActions.deleteCampaignAction(formData);
      if (result.success) {
        toast.success("Campaña eliminada.");
        // router.refresh() es suficiente para obtener los datos actualizados del servidor.
      } else {
        toast.error(result.error || "No se pudo eliminar la campaña.");
        setCampaigns(previousCampaigns); // Revertir en caso de error.
      }
      setDeletingId(null);
    });
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    // No necesitamos mostrar un toast aquí ya que el formulario lo hace.
    // Simplemente refrescamos los datos para mostrar la nueva campaña.
    router.refresh();
  };

  return {
    campaigns,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    deletingId,
    handleDelete,
    handleCreateSuccess,
  };
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `useCampaignsManagement` es un hook de estado especializado, diseñado
 *               para desacoplar la lógica de negocio de la UI de presentación.
 *
 * @functionality
 * - Abstrae toda la gestión de estado (lista de campañas, estado de modales, estados de carga)
 *   lejos del componente `CampaignsClient`. Esto hace que el componente de UI sea más simple,
 *   enfocado en el renderizado y más fácil de probar.
 * - Implementa un patrón de "actualización optimista" para la eliminación: la campaña se elimina
 *   de la UI *instantáneamente*, proporcionando una experiencia de usuario fluida. Si la
 *   Server Action falla, el estado se revierte a su estado anterior y se notifica al usuario.
 * - Orquesta la comunicación con las Server Actions del namespace `campaigns`, manejando tanto
 *   los casos de éxito como los de error y proporcionando feedback al usuario a través de toasts.
 *
 * @relationships
 * - Es el "cerebro" del componente `CampaignsClient` (`app/[...]/campaigns-client.tsx`).
 * - Invoca directamente las Server Actions definidas en `lib/actions/campaigns.actions.ts`.
 * - Depende de `next/navigation` (a través de `lib/navigation.ts`) para refrescar los datos del
 *   servidor tras una operación exitosa.
 *
 * @expectations
 * - Se espera que este hook sea la única fuente de verdad para la lógica de la página de gestión
 *   de campañas. Cualquier nueva interacción (como búsqueda, filtrado o edición en línea) debe
 *   ser implementada aquí para mantener la cohesión y la separación de responsabilidades.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de campañas en la UI.
 *
 * 1.  **Actualización Optimista para Creación:** Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. Este hook puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2.  **Abstracción a un Hook Genérico:** La lógica de estado para `initial`, `optimistic update`, `server call`, `rollback` es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResourceManagement` que acepte las Server Actions de crear/eliminar como parámetros para ser reutilizado en `sites`, `campaigns`, `members`, etc.
 * 3.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "No se puede eliminar una campaña publicada").
 */
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de campañas en la UI.
 *
 * 1.  **Actualización Optimista para Creación:** Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. Este hook puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2.  **Abstracción a un Hook Genérico:** La lógica de estado para `initial`, `optimistic update`, `server call`, `rollback` es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResourceManagement` que acepte las Server Actions de crear/eliminar como parámetros para ser reutilizado en `sites`, `campaigns`, `members`, etc.
 * 3.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "No se puede eliminar una campaña publicada").
 */
