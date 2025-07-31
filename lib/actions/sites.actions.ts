// Ruta: lib/actions/sites.actions.ts
/**
 * @file sites.actions.ts
 * @description Acciones de servidor seguras para la entidad 'sites'. Este aparato ha
 *              sido refactorizado para una máxima cohesión, separando la lógica
 *              de verificación de la de creación, y adhiriéndose al principio de
 *              responsabilidad única.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 5.0.0 (Separation of Concerns & Real-time Validation)
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
  CreateSiteSchema,
  DeleteSiteSchema,
  UpdateSiteSchema,
} from "@/lib/validators";

import { createAuditLog } from "./_helpers";

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

/**
 * @async
 * @function checkSubdomainAvailabilityAction
 * @description Verifica si un subdominio ya está en uso en la plataforma.
 *              Esta acción está optimizada para ser llamada en tiempo real desde el cliente.
 * @param {string} subdomain - El subdominio a verificar.
 * @returns {Promise<ActionResult<{ isAvailable: boolean }>>} El resultado de la verificación.
 */
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
  const authResult = await getAuthenticatedUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    const parsedData = CreateSiteSchema.parse(Object.fromEntries(formData));
    const { name, subdomain, description, workspaceId, icon } = parsedData;

    const isAuthorized = await hasWorkspacePermission(user.id, workspaceId, [
      "owner",
      "admin",
    ]);

    if (!isAuthorized) {
      logger.warn(
        `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó crear un sitio en el workspace ${workspaceId} sin permisos.`
      );
      return {
        success: false,
        error: "No tienes permiso para crear sitios en este workspace.",
      };
    }

    const supabase = createClient();
    const { data: newSite, error } = await supabase
      .from("sites")
      .insert({
        name,
        subdomain,
        description,
        workspace_id: workspaceId,
        owner_id: user.id,
        icon,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Violación de unicidad
        return { success: false, error: "Este subdominio ya está en uso." };
      }
      logger.error("Error al crear el sitio en la base de datos:", error);
      return { success: false, error: "No se pudo crear el sitio." };
    }

    await createAuditLog("site.created", {
      userId: user.id,
      targetEntityId: newSite.id,
      targetEntityType: "site",
      metadata: { subdomain, name, workspaceId },
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
  const authResult = await getAuthenticatedUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    const { siteId, ...updateData } = UpdateSiteSchema.parse(
      Object.fromEntries(formData)
    );

    const site = await sitesData.getSiteById(siteId);
    if (!site) {
      return { success: false, error: "El sitio no fue encontrado." };
    }

    const isAuthorized = await hasWorkspacePermission(
      user.id,
      site.workspace_id,
      ["owner", "admin"]
    );

    if (!isAuthorized) {
      logger.warn(
        `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó actualizar el sitio ${siteId} sin permisos.`
      );
      return {
        success: false,
        error: "No tienes permiso para modificar este sitio.",
      };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("sites")
      .update(updateData)
      .eq("id", siteId);

    if (error) {
      logger.error(`Error al actualizar el sitio ${siteId}:`, error);
      return { success: false, error: "No se pudo actualizar el sitio." };
    }

    await createAuditLog("site.updated", {
      userId: user.id,
      targetEntityId: siteId,
      targetEntityType: "site",
      metadata: { changes: updateData },
    });

    revalidatePath(`/dashboard/sites/${siteId}/settings`);
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
  const authResult = await getAuthenticatedUser();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  try {
    const { siteId } = DeleteSiteSchema.parse({
      siteId: formData.get("siteId"),
    });

    const site = await sitesData.getSiteById(siteId);
    if (!site) {
      return { success: false, error: "El sitio no fue encontrado." };
    }

    const isAuthorized = await hasWorkspacePermission(
      user.id,
      site.workspace_id,
      ["owner", "admin"]
    );

    if (!isAuthorized) {
      logger.warn(
        `[SEGURIDAD] VIOLACIÓN DE ACCESO: Usuario ${user.id} intentó eliminar el sitio ${siteId} sin permisos.`
      );
      return {
        success: false,
        error: "No tienes permiso para eliminar este sitio.",
      };
    }

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
