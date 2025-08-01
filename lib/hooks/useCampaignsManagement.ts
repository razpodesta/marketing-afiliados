// lib/hooks/useCampaignsManagement.ts
/**
 * @file useCampaignsManagement.ts
 * @description Hook de estado especializado para la página de gestión de campañas.
 *              Este aparato ha sido refactorizado para implementar una UI optimista
 *              completa, tanto para la creación como para la eliminación de campañas,
 *              proporcionando una experiencia de usuario instantánea y fluida.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.0.0 (Optimistic Create Implementation)
 *
 * @see {@link file://./useCampaignsManagement.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la gestión de campañas en la UI.
 *
 * 1.  **Abstracción a un Hook Genérico**: (Vigente) La lógica de estado para `initial`, `optimistic update`, `server call`, `rollback` es un patrón reutilizable. Se podría crear un hook genérico `useOptimisticResourceManagement` para ser reutilizado en `sites`, `campaigns`, `members`, etc., reduciendo la duplicación de código.
 * 2.  **Manejo de Errores Más Granular**: (Vigente) En lugar de un toast genérico, se podrían manejar códigos de error específicos devueltos por la Server Action para mostrar mensajes más contextuales al usuario (ej. "No se puede eliminar una campaña publicada").
 * 3.  **Generación de Slug en Cliente**: (Nueva) Para una previsualización más precisa en la UI optimista, la lógica de generación de slugs del esquema Zod podría replicarse en una función de utilidad del lado del cliente y usarse aquí para crear el `slug` del `phantomCampaign`.
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { campaigns as campaignActions } from "@/lib/actions";
import { useRouter } from "@/lib/navigation";
import type { Tables } from "@/lib/types/database";

type Campaign = Tables<"campaigns">;

export function useCampaignsManagement(
  initialCampaigns: Campaign[],
  siteId: string
) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  const handleCreate = (formData: FormData) => {
    const name = formData.get("name") as string;
    if (!name) return;

    const phantomCampaign: Campaign = {
      id: `optimistic-${Date.now()}`,
      name,
      site_id: siteId,
      slug: name.toLowerCase().replace(/\s+/g, "-"), // Slug temporal
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const previousCampaigns = campaigns;
    setCampaigns((current) => [...current, phantomCampaign]);
    setCreateDialogOpen(false);
    setMutatingId(phantomCampaign.id);

    startTransition(async () => {
      const result = await campaignActions.createCampaignAction(formData);
      if (result.success) {
        toast.success("Campaña creada con éxito.");
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo crear la campaña.");
        setCampaigns(previousCampaigns);
      }
      setMutatingId(null);
    });
  };

  const handleDelete = (formData: FormData) => {
    const campaignId = formData.get("campaignId") as string;
    if (!campaignId) return;

    const previousCampaigns = campaigns;
    setCampaigns((current) => current.filter((c) => c.id !== campaignId));
    setMutatingId(campaignId);

    startTransition(async () => {
      const result = await campaignActions.deleteCampaignAction(formData);
      if (result.success) {
        toast.success("Campaña eliminada.");
        router.refresh();
      } else {
        toast.error(result.error || "No se pudo eliminar la campaña.");
        setCampaigns(previousCampaigns);
      }
      setMutatingId(null);
    });
  };

  return {
    campaigns,
    isCreateDialogOpen,
    setCreateDialogOpen,
    isPending,
    deletingId: mutatingId, // Alias para compatibilidad, aunque ahora es genérico
    mutatingId,
    handleDelete,
    handleCreate,
  };
}
// lib/hooks/useCampaignsManagement.ts
