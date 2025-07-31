// Ruta: lib/actions/campaigns.actions.ts
/**
 * @file campaigns.actions.ts
 * @description Acciones de servidor seguras para la entidad 'campaigns'. Este aparato ha
 *              sido refactorizado para una máxima cohesión, eliminando la lógica
 *              redundante de autenticación y normalización de datos, y adhiriéndose
 *              estrictamente al principio de responsabilidad única.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.0.0 (High Cohesion & DRY Refactoring)
 */
"use server";

import { type User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  CreateCampaignSchema,
  DeleteCampaignSchema,
} from "@/lib/validators";

/**
 * @private
 * @async
 * @function getAuthenticatedUser
 * @description Obtiene el usuario autenticado para una acción. Actúa como un
 *              guardián de autenticación para reducir la duplicación de código.
 * @returns {Promise<{ user: User } | { error: ActionResult<never> }>} Un objeto con el
 *          usuario si tiene éxito, o un objeto de error de acción si falla.
 */
async function getAuthenticatedUser(): Promise<
  { user: User } | { error: ActionResult<never> }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { success: false, error: "Usuario no autenticado." } };
  }
  return { user };
}

export async function createCampaignAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    const rawData = Object.fromEntries(formData);
    // LÓGICA REDUNDANTE ELIMINADA: La generación del slug es ahora
    // manejada por el `.transform()` del `CreateCampaignSchema`.
    const { name, slug, siteId } = CreateCampaignSchema.parse(rawData);

    const site = await sitesData.getSiteById(siteId);
    if (!site) {
      return { success: false, error: "El sitio asociado no existe." };
    }

    const isAuthorized = await hasWorkspacePermission(
      user.id,
      site.workspace_id,
      ["owner", "admin", "member"]
    );

    if (!isAuthorized) {
      logger.warn(
        `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó crear una campaña en el sitio ${siteId} sin permisos.`
      );
      return {
        success: false,
        error: "No tienes permiso para crear campañas en este sitio.",
      };
    }

    const supabase = createClient();
    const { data: newCampaign, error } = await supabase
      .from("campaigns")
      .insert({ name, slug, site_id: siteId, content: {} })
      .select("id")
      .single();

    if (error) {
      logger.error("Error al crear la campaña en la base de datos:", error);
      return { success: false, error: "No se pudo crear la campaña." };
    }

    revalidatePath(`/dashboard/sites/${siteId}/campaigns`);
    return { success: true, data: { id: newCampaign.id } };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "Datos inválidos." };
    }
    logger.error("Error inesperado en createCampaignAction:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

export async function deleteCampaignAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  const authResult = await getAuthenticatedUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    const { campaignId } = DeleteCampaignSchema.parse({
      campaignId: formData.get("campaignId"),
    });

    const supabase = createClient();
    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("*, sites ( workspace_id )")
      .eq("id", campaignId)
      .single();

    if (fetchError || !campaign) {
      return { success: false, error: "La campaña no se pudo encontrar." };
    }

    const workspaceId = campaign.sites?.workspace_id;
    if (!workspaceId) {
      logger.error(
        `INCONSISTENCIA DE DATOS: Campaña ${campaignId} sin workspace asociado.`
      );
      return { success: false, error: "Error de integridad de datos." };
    }

    const isAuthorized = await hasWorkspacePermission(user.id, workspaceId, [
      "owner",
      "admin",
      "member",
    ]);

    if (!isAuthorized) {
      logger.warn(
        `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó eliminar la campaña ${campaignId} sin permisos.`
      );
      return {
        success: false,
        error: "No tienes permiso para eliminar esta campaña.",
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
    return { success: true, data: { message: "Campaña eliminada." } };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "ID de campaña inválido." };
    }
    logger.error("Error inesperado en deleteCampaignAction:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}
/**
@fileoverview El aparato campaigns.actions.ts es un componente de seguridad crítico que sirve como el único guardián para las mutaciones de la entidad campaigns.
@functionality
Abstracción de Autenticación: Utiliza un helper privado getAuthenticatedUser para encapsular la lógica de verificación de sesión, adhiriéndose al principio DRY (Don't Repeat Yourself).
createCampaignAction: Valida y transforma los datos de entrada a través del CreateCampaignSchema del manifiesto central. Verifica que el usuario tiene permisos de miembro en el workspace al que pertenece el sitio y luego crea el registro en la base de datos.
deleteCampaignAction: Valida el ID de la campaña a eliminar. Antes de ejecutar la eliminación, realiza el patrón de seguridad "obtener antes de actuar": recupera la campaña, determina a qué workspace pertenece y verifica que el usuario actual tenga permisos sobre dicho workspace.
@relationships
Es invocado por componentes de cliente, principalmente por CreateCampaignForm.tsx y CampaignsClient.tsx.
Depende de forma crítica del guardián de permisos hasWorkspacePermission de lib/data/permissions.ts para hacer cumplir las reglas de autorización.
Interactúa con la capa de datos (lib/data/sites.ts) para obtener información contextual necesaria para las comprobaciones de seguridad.
Utiliza revalidatePath de Next.js para invalidar la caché y asegurar que la UI se actualice después de una mutación de datos.
Consume los esquemas de Zod del manifiesto lib/validators/index.ts.
@expectations
Se espera que este aparato sea una barrera de seguridad robusta para todas las mutaciones de la entidad campaigns. Debe validar todos los datos de entrada y verificar los permisos para cada operación sin excepción. Su lógica debe ser atómica y proporcionar un feedback claro al cliente sobre el resultado de la operación a través del contrato ActionResult.
*/