// lib/actions/builder.actions.ts
/**
 * @file lib/actions/builder.actions.ts
 * @description Contiene las Server Actions específicas del constructor de campañas,
 *              con validación de permisos de seguridad, logging de auditoría y
 *              un contrato de retorno de datos robusto y tipado.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Explicit ActionResult Contract & Enhanced Security)
 * @see {@link file://./tests/lib/actions/builder.actions.test.ts} Para el arnés de pruebas correspondiente.
 */
"use server";

import { revalidatePath } from "next/cache";

import { type CampaignConfig } from "@/lib/builder/types.d";
import { campaigns as campaignsData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Json } from "@/lib/types/database";
import { type ActionResult } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function updateCampaignContentAction
 * @description Actualiza el contenido JSON de una campaña específica. Valida que el
 *              usuario tenga permisos para editar la campaña antes de proceder.
 * @param {string} campaignId - El ID de la campaña a actualizar.
 * @param {CampaignConfig} content - El nuevo objeto de configuración de la campaña.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación, que puede ser un éxito o un fallo con un mensaje de error.
 */
export async function updateCampaignContentAction(
  campaignId: string,
  content: CampaignConfig
): Promise<ActionResult<void>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado." };
  }

  const campaignData = await campaignsData.getCampaignContentById(
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

  await createAuditLog("campaign_content_updated", {
    userId: user.id,
    targetEntityId: campaignId,
    targetEntityType: "campaign",
    metadata: { campaignName: content.name },
  });

  revalidatePath(`/builder/${campaignId}`);

  return { success: true, data: undefined };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Validación de Contenido con Zod**: ((Vigente)) Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para asegurar la integridad de la estructura JSON.
 * 2. **Versionado de Campañas**: ((Vigente)) En lugar de sobrescribir el campo `content`, se podría guardar un historial de versiones en una tabla `campaign_versions`, permitiendo al usuario revertir a estados anteriores.
 * 3. **Bloqueo de Edición en Tiempo Real**: ((Vigente)) Implementar un sistema (usando Supabase Realtime) que impida que dos usuarios editen la misma campaña simultáneamente para prevenir conflictos de datos.
 */
// lib/actions/builder.actions.ts
