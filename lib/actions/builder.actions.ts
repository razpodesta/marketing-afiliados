/**
 * @file lib/actions/builder.actions.ts
 * @description Contiene las Server Actions específicas del constructor de campañas,
 *              ahora con validación de permisos de seguridad y logging de auditoría.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.1.0 (Corrected Data Layer Import)
 */

"use server";

import { revalidatePath } from "next/cache";

import { type CampaignConfig } from "@/lib/builder/types.d";
import * as dataLayer from "@/lib/data"; // CORRECCIÓN: Importar todo el módulo como un namespace.
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Json } from "@/lib/types/database";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function updateCampaignContentAction
 * @description Actualiza el contenido JSON de una campaña específica,
 *              verificando primero que el usuario tiene los permisos necesarios.
 * @param {string} campaignId - El UUID de la campaña a actualizar.
 * @param {CampaignConfig} content - El nuevo objeto de configuración de la campaña.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function updateCampaignContentAction(
  campaignId: string,
  content: CampaignConfig
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  // --- PARCHE DE SEGURIDAD: VERIFICACIÓN DE PERMISOS ---
  // Se utiliza la capa de datos, que ya encapsula la lógica de permisos,
  // para verificar si el usuario puede acceder a esta campaña antes de escribir.
  const campaignData = await dataLayer.campaigns.getCampaignContentById(
    campaignId,
    user.id
  );

  if (!campaignData) {
    logger.warn(
      `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó guardar la campaña ${campaignId} sin permisos.`
    );
    return {
      success: false,
      error: "Acceso denegado. No tienes permiso para editar esta campaña.",
    };
  }
  // --- FIN DEL PARCHE DE SEGURIDAD ---

  const { error } = await supabase
    .from("campaigns")
    .update({
      content: content as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (error) {
    logger.error(`Error al guardar campaña ${campaignId}:`, error);
    return { success: false, error: "No se pudo guardar la campaña." };
  }

  // --- LOG DE AUDITORÍA ---
  await createAuditLog("campaign_content_updated", {
    userId: user.id,
    targetEntityId: campaignId,
    targetEntityType: "campaign",
    metadata: { campaignName: content.name },
  });

  revalidatePath(`/builder/${campaignId}`);
  return { success: true, data: null };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de contenido de campañas.
 *
 * 1.  **Validación de Contenido con Zod:** Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para prevenir la corrupción de datos en la base de datos si la estructura del JSON es incorrecta. Esto añadiría una capa de defensa adicional.
 * 2.  **Versionado de Campañas:** En lugar de sobrescribir el campo `content`, se podría guardar un historial de versiones en una tabla separada (`campaign_versions`). Esto permitiría a los usuarios visualizar cambios y revertir a versiones anteriores, una característica avanzada para cualquier editor.
 * 3.  **Bloqueo de Edición en Tiempo Real:** Implementar un sistema (usando Supabase Realtime) que impida que dos usuarios editen la misma campaña simultáneamente para prevenir la pérdida de datos. La acción podría verificar y establecer un bloqueo antes de guardar.
 */
