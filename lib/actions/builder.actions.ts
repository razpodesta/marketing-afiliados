// lib/actions/builder.actions.ts
/**
 * @file lib/actions/builder.actions.ts
 * @description Contiene las Server Actions específicas del constructor de campañas,
 *              con validación de permisos de seguridad, logging de auditoría y
 *              un contrato de retorno de datos robusto y tipado.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.3.0 (Fix: Definitive Action Result Contract Alignment)
 * @see {@link file://./builder.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la gestión de contenido de campañas.
 *
 * 1.  **Validación de Contenido con Zod:** (Vigente) Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para prevenir la corrupción de datos.
 * 2.  **Versionado de Campañas:** (Vigente) En lugar de sobrescribir el campo `content`, se podría guardar un historial de versiones en una tabla separada (`campaign_versions`).
 * 3.  **Bloqueo de Edición en Tiempo Real:** (Vigente) Implementar un sistema (usando Supabase Realtime) que impida que dos usuarios editen la misma campaña simultáneamente.
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

export async function updateCampaignContentAction(
  campaignId: string,
  content: CampaignConfig
): Promise<ActionResult<void>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

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

  // CORRECCIÓN ESTRUCTURAL: Se incluye explícitamente la propiedad `data` para
  // cumplir con el contrato de tipo `ActionResult<void>`.
  return { success: true, data: undefined };
}
// lib/actions/builder.actions.ts
