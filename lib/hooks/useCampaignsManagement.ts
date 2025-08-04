// lib/hooks/useCampaignsManagement.ts
/**
 * @file useCampaignsManagement.ts
 * @description Hook de estado especializado para la página de gestión de campañas.
 *              Ha sido refactorizado para utilizar el hook genérico reutilizable
 *              `useOptimisticResourceManagement`, eliminando la duplicación de código
 *              y adhiriéndose a la filosofía arquitectónica "Lego".
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.0.0 (Atomic Architecture Refactor)
 * @see {@link file://./useOptimisticResourceManagement.ts} Para la lógica de negocio subyacente.
 */
"use client";

import { useState } from "react";

import { campaigns as campaignActions } from "@/lib/actions";
import { type Tables } from "@/lib/types/database";

import { useOptimisticResourceManagement } from "./useOptimisticResourceManagement";

type Campaign = Tables<"campaigns">;

export function useCampaignsManagement(
  initialCampaigns: Campaign[],
  siteId: string
) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se delega toda la lógica de estado compleja al hook genérico.
  const {
    items: campaigns,
    isPending,
    mutatingId,
    handleCreate: genericHandleCreate,
    handleDelete: genericHandleDelete,
  } = useOptimisticResourceManagement<Campaign>({
    initialItems: initialCampaigns,
    entityName: "Campaña",
    createAction: campaignActions.createCampaignAction,
    deleteAction: campaignActions.deleteCampaignAction,
  });

  /**
   * @function handleCreate
   * @description Envoltura (Wrapper) para la función de creación.
   *              Adapta la firma de la función para construir el ítem optimista
   *              específico de una campaña antes de llamar a la lógica genérica.
   */
  const handleCreate = (formData: FormData) => {
    const name = formData.get("name") as string;
    if (!name) return;

    // Se construye el "ítem fantasma" que se mostrará en la UI inmediatamente.
    const optimisticCampaign = {
      name,
      site_id: siteId,
      slug: name.toLowerCase().replace(/\s+/g, "-"), // Slug temporal
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      affiliate_url: null,
    };

    genericHandleCreate(formData, optimisticCampaign);
    setCreateDialogOpen(false);
  };

  /**
   * @function handleDelete
   * @description Envoltura (Wrapper) para la función de eliminación.
   *              Adapta el nombre del campo ID de 'campaignId' a 'id' para
   *              cumplir con el contrato del hook genérico.
   */
  const handleDelete = (formData: FormData) => {
    const campaignId = formData.get("campaignId");
    if (campaignId) {
      const genericFormData = new FormData();
      genericFormData.append("id", campaignId as string);
      genericHandleDelete(genericFormData);
    }
  };
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

  return {
    campaigns,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    mutatingId,
    handleDelete,
    handleCreate,
  };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Estandarización de ID**: ((Vigente)) Estandarizar el nombre del campo ID a 'id' en todos los formularios y Server Actions para eliminar la necesidad del "adapter" en `handleDelete`.
 *
 * @subsection Mejoras Implementadas
 * 1. **Arquitectura Atómica**: ((Implementada)) Toda la lógica de UI optimista ha sido abstraída al hook `useOptimisticResourceManagement`, resultando en un código más corto, limpio y mantenible.
 * 2. **Patrón Adaptador**: ((Implementada)) Se utilizan funciones "wrapper" para adaptar las necesidades específicas de la UI de campañas al contrato genérico del hook, demostrando un patrón de diseño limpio.
 */
// lib/hooks/useCampaignsManagement.ts
