/**
 * @file lib/actions/sites.actions.ts
 * @description Contiene las Server Actions para la gestión de sitios (subdominios).
 *              Incluye validación de datos y verificaciones de permisos
 *              críticas para la arquitectura multi-tenant, ahora con seguridad
 *              de tipos mejorada.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Type-Safe Permission Handling & Audit Log Detail)
 */
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { requireWorkspacePermission } from "@/lib/auth/user-permissions";
import { getSiteDataByHost } from "@/lib/data/sites";
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
    const existingSite = await getSiteDataByHost(subdomain);
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
 * @description Crea un nuevo sitio (subdominio) asociado al workspace activo.
 * @param {CreateSiteFormState} prevState - El estado anterior del formulario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<CreateSiteFormState>} El nuevo estado del formulario.
 */
export async function createSiteAction(
  prevState: CreateSiteFormState,
  formData: FormData
): Promise<CreateSiteFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const workspaceId = cookies().get("active_workspace_id")?.value;
  if (!workspaceId)
    return { error: "No hay un workspace activo seleccionado." };

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
  const existingSite = await getSiteDataByHost(subdomain);
  if (existingSite) {
    return { error: "Este subdominio ya está en uso." };
  }

  const permissionCheck = await requireWorkspacePermission(workspaceId, [
    "owner",
    "admin",
    "member",
  ]);
  if (!permissionCheck.success) {
    logger.warn(
      `[SitesActions] Violación de seguridad: Usuario ${user.id} intentó crear un sitio en el workspace ${workspaceId} sin permisos. Motivo: ${permissionCheck.error}`
    );
    return { success: false, error: permissionCheck.error };
  }

  const { data: newSite, error } = await supabase
    .from("sites")
    .insert({ subdomain, icon, workspace_id: workspaceId, owner_id: user.id })
    .select("id")
    .single();

  if (error || !newSite) {
    logger.error("[SitesActions] Error al crear el sitio:", error);
    return { error: "No fue posible crear el sitio. Tente nuevamente." };
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
 * @description Excluye un sitio, verificando primero los permisos del usuario.
 * @param {FormData} formData - Debe contener el `siteId` a ser excluido.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function deleteSiteAction(
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();

  const siteId = formData.get("siteId") as string;
  if (!siteId)
    return { success: false, error: "ID de sitio no proporcionado." };

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("workspace_id, subdomain")
    .eq("id", siteId)
    .single();

  if (siteError || !site) {
    return { success: false, error: "Sitio no encontrado." };
  }

  const permissionCheck = await requireWorkspacePermission(site.workspace_id, [
    "owner",
    "admin",
  ]);

  // --- INICIO DE CORRECCIÓN DE TIPO: GUARDA DE TIPO (TYPE GUARD) ---
  // La siguiente comprobación es la solución al error reportado.
  // Al verificar `!permissionCheck.success`, TypeScript entiende que en el
  // bloque de código posterior, `permissionCheck.success` solo puede ser `true`.
  // Esto permite acceder de forma segura a `permissionCheck.data`, ya que el
  // compilador sabe que existe en la rama de éxito de la unión de tipos.
  if (!permissionCheck.success) {
    const userIdForLog = "N/A (No autenticado/Sin permiso)";
    logger.warn(
      `[SitesActions] Violación de seguridad: Usuario ${userIdForLog} intentó excluir el sitio ${siteId} sin permisos. Motivo: ${permissionCheck.error}`
    );
    return {
      success: false,
      error: permissionCheck.error,
    };
  }
  // --- FIN DE CORRECCIÓN DE TIPO ---

  // A partir de aquí, es seguro acceder a `permissionCheck.data`.
  const { user: performingUser } = permissionCheck.data;

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
  return { success: true, data: null };
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer la gestión de sitios.
 *
 * 1.  **Soft Deletes (Exclusión Lógica):** Implementar un sistema de exclusión lógica añadiendo un campo `deleted_at` a la tabla `sites`. La `deleteSiteAction` actualizaría este campo en lugar de una exclusión permanente, permitiendo la recuperación de datos. Todas las consultas de sitios deberían entonces filtrar por `deleted_at IS NULL`.
 * 2.  **Acción de Actualización (`updateSiteAction`):** Crear una nueva Server Action para modificar detalles de un sitio (ej. cambiar el ícono, dominio personalizado). Esa acción debe reutilizar el helper `requireWorkspacePermission` para validación.
 * 3.  **Garantizar Integridad de Datos con Cascade Deletes:** A nivel de base de datos, es crucial establecer una política `ON DELETE CASCADE` en la clave foránea `campaigns.site_id`. Esto garantiza que, al excluir un sitio, todas sus campañas y datos asociados sean automáticamente excluidos, previniendo datos huérfanos.
 */
