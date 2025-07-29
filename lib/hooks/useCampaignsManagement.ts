/**
 * @file lib/hooks/useCampaignsManagement.ts
 * @description Hook personalizado para encapsular toda la lógica de estado y
 *              acciones de la página de gestión de campañas.
 * @author L.I.A Legacy
 * @version 2.1.0 (Architectural Path Correction)
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { campaigns as campaignActions } from "@/lib/actions"; // CORRECCIÓN: La ruta correcta es @/lib/actions.
import type { Tables } from "@/lib/types/database";
import { useRouter } from "@/navigation";

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
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo eliminar la campaña.");
        setCampaigns(previousCampaigns);
      }
      setDeletingId(null);
    });
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    toast.success("¡Campaña creada! Actualizando lista...");
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de campañas en la UI.
 *
 * 1.  **Actualización Optimista para Creación:** Para una experiencia de usuario superior y consistente, la creación de campañas también debería ser optimista. Este hook puede ser mejorado para añadir una "campaña fantasma" a la UI localmente mientras la Server Action se completa, de la misma forma que lo hace el hook `useSitesManagement`.
 * 2.  **Abstracción a un Hook Genérico:** La lógica de estado para `initial`, `optimistic update`, `server call`, `rollback` es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResourceManagement` que acepte las Server Actions de crear/eliminar como parámetros para ser reutilizado en `sites`, `campaigns`, `members`, etc.
 * 3.  **Manejo de Errores Más Granular:** En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "No se puede eliminar una campaña publicada").
 */
