// Ruta: lib/actions/builder.actions.ts
/**
 * @file lib/actions/builder.actions.ts
 * @description Contiene las Server Actions específicas del constructor de campañas,
 *              ahora con validación de permisos de seguridad y logging de auditoría.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.2.0 (Action Result Contract Alignment)
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

  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de contenido de campañas.
 *
 * 1.  **Validación de Contenido con Zod:** (Revalidado) Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para prevenir la corrupción de datos.
 * 2.  **Versionado de Campañas:** (Revalidado) En lugar de sobrescribir el campo `content`, se podría guardar un historial de versiones en una tabla separada (`campaign_versions`).
 * 3.  **Bloqueo de Edición en Tiempo Real:** (Revalidado) Implementar un sistema (usando Supabase Realtime) que impida que dos usuarios editen la misma campaña simultáneamente para prevenir la pérdida de datos.
 */

/**
 * @fileoverview El aparato `builder.actions.ts` contiene las Server Actions que interactúan directamente con el estado del constructor de campañas.
 * @functionality
 * - Su función principal, `updateCampaignContentAction`, es responsable de persistir la estructura JSON de una campaña en la base de datos.
 * - Antes de cualquier operación de escritura, realiza una verificación de permisos rigurosa, asegurando que el usuario que realiza la acción es miembro del workspace al que pertenece la campaña.
 * - Registra un evento de auditoría detallado tras una actualización exitosa.
 * - Invalida la caché de Next.js para la página del constructor, asegurando que las futuras cargas reflejen los cambios guardados.
 * @relationships
 * - Es invocado por el componente `BuilderHeader.tsx` cuando el usuario hace clic en el botón "Guardar".
 * - Depende de la capa de datos (`lib/data/campaigns.ts`) para la verificación de permisos.
 * - Depende del helper de auditoría (`lib/actions/_helpers/audit-log.helper.ts`).
 * @expectations
 * - Se espera que este aparato sea el único punto de entrada para modificar el contenido de una campaña. Debe ser seguro, transaccional y proporcionar un feedback claro sobre el resultado de la operación a través del objeto `ActionResult`.
 */
// Ruta: lib/actions/builder.actions.ts
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para la gestión de contenido de campañas.
 *
 * 1.  **Validación de Contenido con Zod:** Antes de guardar, el objeto `content` debe ser validado contra un `CampaignConfigSchema` de Zod para prevenir la corrupción de datos en la base de datos si la estructura del JSON es incorrecta. Esto añadiría una capa de defensa adicional.
 * 2.  **Versionado de Campañas:** En lugar de sobrescribir el campo `content`, se podría guardar un historial de versiones en una tabla separada (`campaign_versions`). Esto permitiría a los usuarios visualizar cambios y revertir a versiones anteriores, una característica avanzada para cualquier editor.
 * 3.  **Bloqueo de Edición en Tiempo Real:** Implementar un sistema (usando Supabase Realtime) que impida que dos usuarios editen la misma campaña simultáneamente para prevenir la pérdida de datos. La acción podría verificar y establecer un bloqueo antes de guardar.
 */
