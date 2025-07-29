// Ruta: lib/actions/sites.actions.ts
/**
 * @file lib/actions/sites.actions.ts
 * @description Contiene las Server Actions para la gestión de sitios (subdominios).
 *              Este aparato orquesta la lógica de negocio, delegando la validación de
 *              permisos y el acceso a datos a los aparatos de seguridad y datos
 *              correspondientes para una máxima cohesión y bajo acoplamiento.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 7.2.0 (Action Result Contract Alignment)
 */
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { sites as sitesData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  type CreateSiteFormState,
  SiteSchema,
} from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @async
 * @function checkSubdomainAvailabilityAction
 * @description Verifica si un subdominio ya existe en la base de datos.
 *              Delega la consulta a la capa de datos.
 * @param {string} subdomain - El subdominio a ser verificado.
 * @returns {Promise<{ isAvailable: boolean }>} Un objeto indicando la disponibilidad.
 */
export async function checkSubdomainAvailabilityAction(
  subdomain: string
): Promise<{ isAvailable: boolean }> {
  if (!subdomain || subdomain.length < 3) {
    return { isAvailable: false };
  }
  try {
    const existingSite = await sitesData.getSiteDataByHost(subdomain);
    return { isAvailable: !existingSite };
  } catch (error) {
    logger.error(
      `[SitesActions] Error al verificar disponibilidad de ${subdomain}:`,
      error
    );
    return { isAvailable: false };
  }
}

/**
 * @async
 * @function createSiteAction
 * @description Orquesta la creación de un nuevo sitio (subdominio) asociado al workspace activo.
 * @param {CreateSiteFormState} prevState - El estado anterior del formulario (no utilizado aquí).
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<CreateSiteFormState>} El nuevo estado del formulario para la UI.
 */
export async function createSiteAction(
  prevState: CreateSiteFormState,
  formData: FormData
): Promise<CreateSiteFormState> {
  const workspaceId = cookies().get("active_workspace_id")?.value;
  if (!workspaceId) {
    return { error: "No hay un workspace activo seleccionado." };
  }

  const permissionCheck = await requireWorkspacePermission(workspaceId, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    return { error: permissionCheck.error };
  }
  const { user } = permissionCheck.data;

  const validation = SiteSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validation.success) {
    return {
      error:
        validation.error.flatten().fieldErrors.subdomain?.[0] ||
        "Datos inválidos.",
    };
  }

  const { subdomain, icon } = validation.data;
  const existingSite = await sitesData.getSiteDataByHost(subdomain);
  if (existingSite) {
    return { error: "Este subdominio ya está en uso." };
  }

  const supabase = createClient();
  const { data: newSite, error } = await supabase
    .from("sites")
    .insert({ subdomain, icon, workspace_id: workspaceId, owner_id: user.id })
    .select("id")
    .single();

  if (error || !newSite) {
    logger.error("[SitesActions] Error al crear el sitio:", error);
    return { error: "No fue posible crear el sitio. Intente nuevamente." };
  }

  await createAuditLog("site_created", {
    userId: user.id,
    targetEntityId: newSite.id,
    targetEntityType: "site",
    metadata: { subdomain, workspaceId },
  });

  revalidatePath("/dashboard/sites");
  return { success: true };
}

/**
 * @async
 * @function deleteSiteAction
 * @description Orquesta la exclusión de un sitio, verificando primero los permisos del usuario.
 * @param {FormData} formData - Debe contener el `siteId` a ser excluido.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function deleteSiteAction(
  formData: FormData
): Promise<ActionResult> {
  const siteId = formData.get("siteId") as string;
  if (!siteId) {
    return { success: false, error: "ID de sitio no proporcionado." };
  }

  const site = await sitesData.getSiteById(siteId);
  if (!site) {
    return { success: false, error: "Sitio no encontrado." };
  }

  const permissionCheck = await requireWorkspacePermission(site.workspace_id, [
    "owner",
    "admin",
  ]);
  if (!permissionCheck.success) {
    return { success: false, error: permissionCheck.error };
  }
  const { user: performingUser } = permissionCheck.data;

  const supabase = createClient();
  const { error: deleteError } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);

  if (deleteError) {
    logger.error(
      `[SitesActions] Error al excluir el sitio ${siteId} por el usuario ${performingUser.id}:`,
      deleteError
    );
    return { success: false, error: "No fue posible excluir el sitio." };
  }

  await createAuditLog("site_deleted", {
    userId: performingUser.id,
    targetEntityId: siteId,
    targetEntityType: "site",
    metadata: { subdomain: site.subdomain, workspaceId: site.workspace_id },
  });

  revalidatePath("/dashboard/sites", "layout");
  // CORRECCIÓN: Se omite el campo `data` para cumplir con el tipo `ActionResult<void>`.
  return { success: true };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer la gestión de sitios.
 *
 * 1.  **Soft Deletes (Exclusión Lógica):** (Revalidado) Implementar un sistema de exclusión lógica añadiendo un campo `deleted_at` a la tabla `sites`.
 * 2.  **Acción de Actualización (`updateSiteAction`):** (Revalidado) Crear una nueva Server Action para modificar detalles de un sitio (ej. cambiar el ícono, dominio personalizado).
 * 3.  **Garantizar Integridad de Datos con Cascade Deletes:** (Revalidado) A nivel de base de datos, es crucial establecer una política `ON DELETE CASCADE` en la clave foránea `campaigns.site_id`.
 */

/**
 * @fileoverview El aparato `sites.actions.ts` contiene las Server Actions para las operaciones CRUD de los sitios.
 * @functionality
 * - Proporciona una función pública (`checkSubdomainAvailabilityAction`) para la validación asíncrona de subdominios en la UI.
 * - Define las operaciones de negocio para crear y eliminar sitios.
 * - Cada acción implementa un flujo robusto de validación, autorización, ejecución y auditoría.
 * @relationships
 * - Es invocado por los componentes de cliente en `app/[locale]/dashboard/sites/`.
 * - Depende del Guardián de Permisos (`lib/auth/user-permissions.ts`) y de la capa de datos (`lib/data/sites.ts`).
 * @expectations
 * - Se espera que este aparato sea la única vía para modificar las entidades de sitio, encapsulando toda la lógica de negocio y seguridad relevante.
 */
// Ruta: lib/actions/sites.actions.ts
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer la gestión de sitios.
 *
 * 1.  **Soft Deletes (Exclusión Lógica):** Implementar un sistema de exclusión lógica añadiendo un campo `deleted_at` a la tabla `sites`. La `deleteSiteAction` actualizaría este campo en lugar de una exclusión permanente, permitiendo la recuperación de datos. Todas las consultas de sitios deberían entonces filtrar por `deleted_at IS NULL`.
 * 2.  **Acción de Actualización (`updateSiteAction`):** Crear una nueva Server Action para modificar detalles de un sitio (ej. cambiar el ícono, dominio personalizado). Esa acción debe reutilizar el helper `requireWorkspacePermission` para validación.
 * 3.  **Garantizar Integridad de Datos con Cascade Deletes:** A nivel de base de datos, es crucial establecer una política `ON DELETE CASCADE` en la clave foránea `campaigns.site_id`. Esto garantiza que, al excluir un sitio, todas sus campañas y datos asociados sean automáticamente excluidos, previniendo datos huérfanos.
 */
