// Ruta: app/actions/campaigns.actions.ts
/**
 * @file campaigns.actions.ts
 * @description Contiene las Server Actions para la gestión de campañas.
 *              Incluye validación de datos y verificaciones de permisos
 *              críticas para la arquitectura multi-tenant.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult } from "./schemas";
import type { Database } from "@/lib/types/database";

/**
 * @description Esquema de validación para la creación de una nueva campaña.
 */
const CampaignSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  siteId: z.string().uuid("ID de sitio inválido."),
});

/**
 * @description Verifica si el usuario autenticado tiene permiso para modificar un sitio.
 * @param {string} siteId - El ID del sitio a verificar.
 * @param {string} userId - El ID del usuario que realiza la acción.
 * @returns {Promise<boolean>} `true` si el usuario tiene permiso, `false` en caso contrario.
 */
async function canUserModifySite(
  siteId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("workspace_id")
    .eq("id", siteId)
    .single();

  if (siteError || !site) return false;

  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("workspace_id", site.workspace_id);

  return memberCount !== 0;
}

/**
 * @description Crea una nueva campaña para un sitio específico.
 * @param {any} prevState - Estado anterior del formulario.
 * @param {FormData} formData - Datos del formulario.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function createCampaignAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const validation = CampaignSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.flatten().fieldErrors.name?.[0] || "Datos inválidos.",
    };
  }

  const { name, siteId } = validation.data;

  const hasPermission = await canUserModifySite(siteId, user.id);
  if (!hasPermission) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: Usuario ${user.id} intentó crear una campaña en el sitio ${siteId} sin permisos.`
    );
    return {
      success: false,
      error: "No tienes permiso para realizar esta acción.",
    };
  }

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const { error } = await supabase
    .from("campaigns")
    .insert({ name, site_id: siteId, slug });

  if (error) {
    logger.error(`Error al crear la campaña para el sitio ${siteId}:`, error);
    return { success: false, error: "No se pudo crear la campaña." };
  }

  revalidatePath(`/dashboard/sites/${siteId}/campaigns`);
  return { success: true, data: null };
}

/**
 * @description Elimina una campaña específica.
 * @param {FormData} formData - Debe contener `campaignId`.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function deleteCampaignAction(
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const campaignId = formData.get("campaignId") as string;
  if (!campaignId)
    return { success: false, error: "ID de campaña no proporcionado." };

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("site_id")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return { success: false, error: "Campaña no encontrada." };
  }

  const hasPermission = await canUserModifySite(campaign.site_id, user.id);
  if (!hasPermission) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: Usuario ${user.id} intentó eliminar la campaña ${campaignId} sin permisos.`
    );
    return {
      success: false,
      error: "No tienes permiso para realizar esta acción.",
    };
  }

  const { error: deleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId);

  if (deleteError) {
    logger.error(`Error al eliminar la campaña ${campaignId}:`, deleteError);
    return { success: false, error: "No se pudo eliminar la campaña." };
  }

  revalidatePath(`/dashboard/sites/${campaign.site_id}/campaigns`);
  return { success: true, data: null };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Generación de Slugs Únicos: La lógica actual de generación de slugs es simple y puede producir duplicados. Se debería mejorar para que, si un slug ya existe dentro de un sitio, se le añada un sufijo numérico (ej. `mi-campana-2`).
 * 2. Acción de Actualización (`updateCampaignAction`): Implementar una acción para modificar los detalles de una campaña (como el nombre o el slug), incluyendo las mismas verificaciones de permisos.
 * 3. Logging de Auditoría en Base de Datos: Ambas acciones, `createCampaignAction` y `deleteCampaignAction`, son operaciones significativas que deberían ser registradas en la tabla `audit_logs` para un seguimiento de seguridad completo.
 */
