// Ruta: lib/hooks/useCampaignsManagement.ts
"use client";

import { campaigns as campaignActions } from "@/app/actions";
import type { Tables } from "@/lib/types/database";
import { useRouter } from "@/navigation";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

type Campaign = Tables<"campaigns">;

/**
 * @file useCampaignsManagement.ts
 * @description Hook personalizado para encapsular toda la lógica de estado y
 *              acciones de la página de gestión de campañas.
 * REFACTORIZACIÓN DE ESTABILIDAD:
 * 1.  Se ha añadido tipado explícito `useState<Campaign[]>` para prevenir
 *     la inferencia de tipo 'never' por parte de TypeScript.
 *
 * @author L.I.A Legacy
 * @version 1.1.0 (Type Stability Patch)
 */
export function useCampaignsManagement(initialCampaigns: Campaign[]) {
  // CORRECCIÓN: Se añade el tipo explícito para el estado.
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
