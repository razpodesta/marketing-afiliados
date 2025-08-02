// lib/actions/campaigns.actions.ts
/**
 * @file campaigns.actions.ts
 * @description Acciones de servidor seguras para la entidad 'campaigns'. Este aparato ha
 *              sido refactorizado para una máxima cohesión y seguridad, adhiriéndose
 *              estrictamente al principio de responsabilidad única.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 4.0.0 (High Cohesion & DRY Refactoring)
 *
 * @see {@link file://./campaigns.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la capa de acciones de campañas.
 *
 * 1.  **Transacciones Atómicas**: (Vigente) La creación de una campaña y su log de auditoría deberían ocurrir dentro de una transacción de base de datos para garantizar que si una falla, la otra se revierte.
 * 2.  **Manejo de Errores Granular**: (Vigente) Mapear códigos de error específicos de PostgreSQL (ej. violación de clave foránea) a mensajes de error más amigables para el usuario.
 * 3.  **Acción de Duplicar Campaña**: (Vigente) Crear una nueva `duplicateCampaignAction(campaignId)` que copie una campaña existente, incluyendo su `content`, para agilizar el flujo de trabajo del usuario.
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

import { createAuditLog } from "./_helpers";

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

    await createAuditLog("campaign.created", {
      userId: user.id,
      targetEntityId: newCampaign.id,
      targetEntityType: "campaign",
      metadata: { name, siteId },
    });

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

    await createAuditLog("campaign.deleted", {
      userId: user.id,
      targetEntityId: campaign.id,
      targetEntityType: "campaign",
      metadata: { name: campaign.name, siteId: campaign.site_id },
    });

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
// lib/actions/campaigns.actions.ts
