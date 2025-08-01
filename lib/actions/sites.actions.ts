// Ruta: lib/actions/sites.actions.ts
/**
 * @file sites.actions.ts
 * @description Acciones de servidor seguras para la entidad 'sites'. Este aparato ha
 *              sido refactorizado para una máxima cohesión, separando la lógica
 *              de verificación de la de creación, y adhiriéndose al principio de
 *              responsabilidad única. Se ha corregido la referencia al campo 'icon'
 *              en `createSiteAction` después de su eliminación del esquema Zod.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 5.0.1 (Icon Field Removal Alignment)
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
    // Se elimina la desestructuración de 'icon' ya que no está en CreateSiteSchema.
    const { name, subdomain, description, workspaceId } = parsedData;

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
        // icon ya no se pasa aquí, se insertará como NULL por defecto de la BD
        // icon, // ELIMINADO
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

/* MEJORAS FUTURAS DETECTADAS
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer y expandir las Server Actions de sitios.
 *
 * 1.  **Soft Deletes para `deleteSiteAction`:** En lugar de una eliminación permanente (`.delete()`), añadir una columna `deleted_at: string | null` a la tabla `sites`. La acción `deleteSiteAction` actualizaría esta columna con un timestamp, marcando el sitio como "eliminado lógicamente" y permitiendo la recuperación. Esto requeriría ajustar las consultas de lectura en la capa de datos para excluir sitios con `deleted_at` no nulo.
 * 2.  **Rate Limiting con `rateLimiter.check`:** Para `createSiteAction` y `checkSubdomainAvailabilityAction`, integrar el helper `rateLimiter.check` (similar a `auth.actions.ts`) para proteger contra abusos o ataques de fuerza bruta, limitando la frecuencia de creación de sitios o verificaciones de subdominios por IP o por usuario.
 * 3.  **Manejo de Errores Granular y Mapeado:** Implementar una función helper para mapear `error.code` de Supabase a mensajes de error amigables para el usuario. Por ejemplo, si un error de `createSiteAction` es un fallo de RLS, mapearlo a "No tienes los permisos adecuados para esta acción" en lugar de un genérico "No se pudo crear el sitio".
 * 4.  **Integración con Límites de Plan (`createSiteAction`):** Antes de crear un sitio, verificar el plan de suscripción del usuario o del workspace (`profiles.plan_id` o `workspaces.plan_id`). Si ya han alcanzado el `max_sites` permitido por su plan, la acción debería fallar con un mensaje claro como "Has alcanzado el límite de sitios para tu plan actual. Considera actualizar tu suscripción.".
 * 5.  **Transacciones de Base de Datos para Atomicidad:** Para `createSiteAction` (que implica insertar en `sites` y luego en `audit_logs`), considerar el uso de una función RPC de PostgreSQL personalizada (similar a `create_workspace_with_owner`) para ejecutar ambas operaciones como una única transacción atómica. Esto asegura que si una parte falla, todo se revierta, manteniendo la integridad.
 * 6.  **Validación de Dominio Personalizado (`updateSiteAction`):** Si se añade un campo `custom_domain` a `UpdateSiteSchema`, la acción `updateSiteAction` debería incluir una validación adicional para asegurar que el dominio es válido, no está en uso por otro cliente, y (futuramente) que el usuario tiene permisos para configurarlo (ej. a través de verificación de DNS TXT record).
 * 7. **Soporte para `icon` null en `createSiteAction`:** El campo `icon` en la base de datos es `nullable`. Aunque se eliminó del formulario, la acción debe ser explícitamente compatible con recibirlo como `null` o no recibirlo en absoluto, para evitar problemas si se añaden sitios desde otras fuentes o si la BD tiene un valor por defecto. La solución actual (no pasarlo si no existe en `parsedData`) es correcta y resultará en `NULL` en la BD.
 */
