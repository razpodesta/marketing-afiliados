// lib/actions/sites.actions.ts
/**
 * @file sites.actions.ts
 * @description Acciones de servidor seguras para la entidad 'sites'. Ha sido
 *              refactorizado para utilizar el guardián de permisos de alto
 *              nivel `requireSitePermission` y para consumir datos ya transformados
 *              desde la capa de validación.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 9.0.0 (Automated Case Transformation)
 */
"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import {
  requireSitePermission,
  requireWorkspacePermission,
} from "@/lib/auth/user-permissions";
import { sites as sitesData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  CreateSiteServerSchema,
  DeleteSiteSchema,
  UpdateSiteSchema,
} from "@/lib/validators";

import { createAuditLog } from "./_helpers";

export async function checkSubdomainAvailabilityAction(
  subdomain: string
): Promise<ActionResult<{ isAvailable: boolean }>> {
  if (!subdomain || subdomain.length < 3) {
    return { success: false, error: "Subdominio inválido." };
  }
  try {
    const existingSite = await sitesData.getSiteDataByHost(subdomain);
    return { success: true, data: { isAvailable: !existingSite } };
  } catch (error) {
    logger.error(`Error al verificar el subdominio ${subdomain}:`, error);
    return { success: false, error: "Error del servidor al verificar." };
  }
}

export async function createSiteAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsedData = CreateSiteServerSchema.parse(
      Object.fromEntries(formData)
    );
    const { workspace_id, subdomain, name } = parsedData;

    const permissionCheck = await requireWorkspacePermission(workspace_id, [
      "owner",
      "admin",
    ]);

    if (!permissionCheck.success) {
      return {
        success: false,
        error: "No tienes permiso para crear sitios en este workspace.",
      };
    }
    const { data: user } = permissionCheck;
    const supabase = createClient();

    const { data: newSite, error } = await supabase
      .from("sites")
      .insert({ ...parsedData, owner_id: user.id })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Este subdominio ya está en uso." };
      }
      logger.error("Error al crear el sitio en la base de datos:", error);
      return { success: false, error: "No se pudo crear el sitio." };
    }

    await createAuditLog("site.created", {
      userId: user.id,
      targetEntityId: newSite.id,
      targetEntityType: "site",
      metadata: { subdomain, name, workspaceId: workspace_id },
    });

    revalidatePath("/dashboard/sites");
    return { success: true, data: { id: newSite.id } };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "Datos de formulario inválidos." };
    }
    logger.error("Error inesperado en createSiteAction:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

export async function updateSiteAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  try {
    const { site_id, ...updateData } = UpdateSiteSchema.parse(
      Object.fromEntries(formData)
    );

    const permissionCheck = await requireSitePermission(site_id, [
      "owner",
      "admin",
    ]);
    if (!permissionCheck.success) {
      if (permissionCheck.error === "NOT_FOUND") {
        return { success: false, error: "El sitio no fue encontrado." };
      }
      return {
        success: false,
        error: "No tienes permiso para modificar este sitio.",
      };
    }
    const { user } = permissionCheck.data;

    const supabase = createClient();
    const { error } = await supabase
      .from("sites")
      .update(updateData)
      .eq("id", site_id);

    if (error) {
      logger.error(`Error al actualizar el sitio ${site_id}:`, error);
      return { success: false, error: "No se pudo actualizar el sitio." };
    }

    await createAuditLog("site.updated", {
      userId: user.id,
      targetEntityId: site_id,
      targetEntityType: "site",
      metadata: { changes: updateData },
    });

    revalidatePath(`/dashboard/sites/${site_id}/settings`);
    revalidatePath("/dashboard/sites");
    return {
      success: true,
      data: { message: "Sitio actualizado correctamente." },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "Datos de formulario inválidos." };
    }
    logger.error("Error inesperado en updateSiteAction:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

export async function deleteSiteAction(
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  try {
    const { siteId } = DeleteSiteSchema.parse({
      siteId: formData.get("siteId"),
    });

    const permissionCheck = await requireSitePermission(siteId, [
      "owner",
      "admin",
    ]);
    if (!permissionCheck.success) {
      if (permissionCheck.error === "NOT_FOUND") {
        return { success: false, error: "El sitio no fue encontrado." };
      }
      return {
        success: false,
        error: "No tienes permiso para eliminar este sitio.",
      };
    }
    const { user, site } = permissionCheck.data;

    const supabase = createClient();
    const { error } = await supabase.from("sites").delete().eq("id", siteId);

    if (error) {
      logger.error(`Error al eliminar el sitio ${siteId}:`, error);
      return { success: false, error: "No se pudo eliminar el sitio." };
    }

    await createAuditLog("site.deleted", {
      userId: user.id,
      targetEntityId: siteId,
      targetEntityType: "site",
      metadata: { subdomain: site.subdomain },
    });

    revalidatePath("/dashboard/sites");
    return {
      success: true,
      data: { message: "Sitio eliminado correctamente." },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "ID de sitio inválido." };
    }
    logger.error("Error inesperado en deleteSiteAction:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}
/**
 * @section MEJORA CONTINUA
 * @subsection Melhorias Implementadas
 * 1. **Consumo de Dados Transformados**: ((Implementada)) As ações `createSiteAction` e `updateSiteAction` agora recebem dados já em `snake_case` da camada de validação, simplificando as chamadas à base de dados e eliminando o mapeamento manual de chaves.
 */
// lib/actions/sites.actions.ts
