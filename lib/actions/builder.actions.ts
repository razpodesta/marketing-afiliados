// Ruta: app/actions/builder.actions.ts
/**
 * @file app/actions/builder.actions.ts
 * @description Contiene las Server Actions específicas del constructor de campañas.
 * REFACTORIZACIÓN DE TIPOS: Se ha corregido la ruta de importación de los tipos
 * de base de datos para alinearla con la nueva estructura modular.
 *
 * @author Metashark
 * @version 1.1.0 (Type Path Correction)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { revalidatePath } from "next/cache";
import { type CampaignConfig } from "@/lib/builder/types.d";
import { type Json } from "@/lib/types/database"; // <-- CORRECCIÓN
import { type ActionResult } from "./schemas";

/**
 * @description Actualiza el contenido JSON de una campaña específica.
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

  // TODO: Añadir verificación de que el usuario pertenece al workspace de la campaña.

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

  revalidatePath(`/builder/${campaignId}`);
  return { success: true, data: null };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Verificación de Permisos de Workspace: Es CRÍTICO implementar el `TODO` para verificar que el `user.id` que ejecuta la acción es miembro del workspace al que pertenece la campaña, previniendo modificaciones no autorizadas.
 * 2. Validación de Contenido con Zod: Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para prevenir la corrupción de datos en la base de datos.
 * 3. Versionado de Campañas: En lugar de sobrescribir el `content`, se podría guardar un historial de versiones en una tabla separada, permitiendo a los usuarios revertir a versiones anteriores.
 */
