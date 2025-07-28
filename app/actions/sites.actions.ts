// Ruta: app/actions/sites.actions.ts
/**
 * @file app/actions/sites.actions.ts
 * @description Contiene las Server Actions para la gestión de sitios (subdominios).
 * REFACTORIZACIÓN 360 - SEGURIDAD Y ARQUITECTURA:
 * 1. La lógica de permisos de eliminación ha sido abstraída al nuevo módulo
 *    centralizado `lib/auth/permissions.ts`, mejorando la mantenibilidad y el DRY.
 * 2. Integrado el logging de auditoría para registrar eventos de creación y eliminación.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Centralized Permissions Refactor)
 */
"use server";

import { getSiteDataBySubdomain } from "@/lib/data/sites";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAuditLog } from "./_helpers";
import {
  SiteSchema,
  type ActionResult,
  type CreateSiteFormState,
} from "./schemas";
import { hasWorkspacePermission } from "@/lib/auth/permissions"; // <-- NUEVA IMPORTACIÓN

/**
 * @description Comprueba si un subdominio ya existe en la base de datos.
 * @param {string} subdomain - El subdominio a verificar.
 * @returns {Promise<{ isAvailable: boolean }>} Un objeto indicando la disponibilidad.
 */
export async function checkSubdomainAvailabilityAction(
  subdomain: string
): Promise<{ isAvailable: boolean }> {
  if (!subdomain || subdomain.length < 3) {
    return { isAvailable: false };
  }
  try {
    const existingSite = await getSiteDataBySubdomain(subdomain);
    return { isAvailable: !existingSite };
  } catch (error) {
    logger.error(`Error al verificar disponibilidad de ${subdomain}:`, error);
    return { isAvailable: false };
  }
}

/**
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
  const existingSite = await getSiteDataBySubdomain(subdomain);
  if (existingSite) {
    return { error: "Este subdominio ya está en uso." };
  }

  const { data: newSite, error } = await supabase
    .from("sites")
    .insert({ subdomain, icon, workspace_id: workspaceId })
    .select("id")
    .single();

  if (error || !newSite) {
    logger.error("Error al crear el sitio:", error);
    return { error: "No se pudo crear el sitio. Inténtalo de nuevo." };
  }

  await createAuditLog("site_created", {
    userId: user.id,
    siteId: newSite.id,
    subdomain,
    workspaceId,
  });

  revalidatePath("/dashboard/sites");
  return { success: true };
}

/**
 * @description Elimina un sitio, verificando primero los permisos del usuario.
 * @param {FormData} formData - Debe contener el `siteId` a eliminar.
 * @returns {Promise<ActionResult>} El resultado de la operación.
 */
export async function deleteSiteAction(
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

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

  // REFACTORIZACIÓN: Lógica de permisos centralizada
  const isAuthorized = await hasWorkspacePermission(
    user.id,
    site.workspace_id,
    ["owner", "admin"]
  );

  if (!isAuthorized) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: Usuario ${user.id} intentó eliminar el sitio ${siteId} sin permisos.`
    );
    return {
      success: false,
      error: "No tienes los permisos necesarios para eliminar este sitio.",
    };
  }

  const { error: deleteError } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);

  if (deleteError) {
    logger.error(
      `Error al eliminar el sitio ${siteId} por el usuario ${user.id}:`,
      deleteError
    );
    return { success: false, error: "No se pudo eliminar el sitio." };
  }

  await createAuditLog("site_deleted", {
    userId: user.id,
    siteId: siteId,
    subdomain: site.subdomain,
    workspaceId: site.workspace_id,
  });

  revalidatePath("/dashboard/sites", "layout");
  return { success: true, data: null };
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Soft Deletes: Implementar un sistema de borrado lógico añadiendo un campo `deleted_at` a la tabla `sites`. La `deleteSiteAction` actualizaría este campo en lugar de una eliminación permanente, permitiendo la recuperación de datos.
 * 2. Update Site Action: Crear una nueva acción `updateSiteAction` para modificar detalles de un sitio (ej. cambiar el ícono o el subdominio). Esta acción deberá reutilizar el helper `hasWorkspacePermission` para la validación.
 * 3. Garantizar Integridad de Datos con Cascade Deletes: A nivel de base de datos, es crucial establecer una política `ON DELETE CASCADE` en la clave foránea `campaigns.site_id`. Esto asegura que al eliminar un sitio, todas sus campañas y datos asociados se eliminen automáticamente, previniendo datos huérfanos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Eliminación en Cascada (Cascade Delete): La eliminación actual solo borra la fila en la tabla `sites`. Es crucial configurar una eliminación en cascada en la base de datos (usando `ON DELETE CASCADE` en las claves foráneas) para que al eliminar un sitio, también se eliminen automáticamente todas las campañas, páginas y datos asociados a él, previniendo datos huérfanos.
 * 2. Soft Deletes (Borrado Lógico): Para permitir la recuperación de sitios eliminados accidentalmente, se podría implementar un sistema de "soft delete". Esto implicaría añadir una columna `deleted_at` a la tabla `sites`. La acción de eliminar simplemente establecería una marca de tiempo en esta columna, y todas las consultas de la aplicación se modificarían para filtrar los sitios donde `deleted_at` es nulo.
 * 3. Logging de Auditoría en Base de Datos: La `deleteSiteAction` es una acción crítica que debería ser registrada en la tabla `audit_logs` usando la función helper `createAuditLog`, incluyendo qué usuario eliminó qué sitio y cuándo.
 */
