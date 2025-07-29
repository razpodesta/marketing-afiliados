/**
 * @file lib/auth/user-permissions.ts
 * @description Este módulo centraliza todas las operaciones relacionadas con la obtención
 *              y verificación de roles y permisos de usuarios. Actúa como un
 *              "guardián" de seguridad para toda la aplicación.
 * @author L.I.A Legacy
 * @version 1.1.0 (Server Action Contract Fix)
 */

"use server";

import { type User } from "@supabase/supabase-js";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

import { hasWorkspacePermission } from "./permissions";

type AppRole = Database["public"]["Enums"]["app_role"];
type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @typedef {object} UserAuthData
 * @property {User} user - El objeto de usuario de Supabase.
 * @property {AppRole} appRole - El rol de la aplicación del usuario.
 * @property {WorkspaceRole | null} activeWorkspaceRole - El rol del usuario en el workspace activo, si existe.
 * @property {string | null} activeWorkspaceId - El ID del workspace activo, si existe.
 */
export type UserAuthData = {
  user: User;
  appRole: AppRole;
  activeWorkspaceRole: WorkspaceRole | null;
  activeWorkspaceId: string | null;
};

let cachedUserAuthData: UserAuthData | null = null;

/**
 * @async
 * @function getAuthenticatedUserAuthData
 * @description Obtiene los datos de autenticación y perfil del usuario autenticado, incluyendo
 *              el rol de la aplicación y, opcionalmente, el rol en el workspace activo.
 *              Los datos se cachean por petición para evitar consultas redundantes.
 * @returns {Promise<UserAuthData | null>} Los datos de autenticación del usuario, o `null` si no está autenticado o no tiene perfil.
 */
export async function getAuthenticatedUserAuthData(): Promise<UserAuthData | null> {
  if (cachedUserAuthData) {
    logger.trace(
      "[UserPermissions] Datos del usuario cargados desde el cache."
    );
    return cachedUserAuthData;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    logger.error(
      `[UserPermissions] Error al cargar perfil para user ${user.id}:`,
      profileError
    );
    return null;
  }

  let activeWorkspaceId: string | null = null;
  let activeWorkspaceRole: WorkspaceRole | null = null;

  try {
    const { cookies } = await import("next/headers");
    const activeWorkspaceCookie = cookies().get("active_workspace_id");
    if (activeWorkspaceCookie?.value) {
      activeWorkspaceId = activeWorkspaceCookie.value;

      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("workspace_id", activeWorkspaceId)
        .single();

      if (memberError && memberError.code !== "PGRST116") {
        logger.warn(
          `[UserPermissions] No se pudo obtener el rol para el workspace ${activeWorkspaceId} y user ${user.id}:`,
          memberError
        );
      } else if (member) {
        activeWorkspaceRole = member.role;
      }
    }
  } catch (e) {
    logger.debug(
      "[UserPermissions] No se pudieron leer las cookies (probablemente en un contexto no HTTP/pruebas)."
    );
  }

  const userData: UserAuthData = {
    user,
    appRole: profile.app_role,
    activeWorkspaceId,
    activeWorkspaceRole,
  };

  cachedUserAuthData = userData;
  return userData;
}

/**
 * @async
 * @function requireAppRole
 * @description Verifica si el usuario autenticado posee uno de los roles de aplicación requeridos.
 *              Si el usuario no tiene el rol, retorna un objeto de error.
 * @param {AppRole[]} requiredRoles - Un array de roles de aplicación permitidos.
 * @returns {Promise<{ success: true, data: UserAuthData } | { success: false, error: string }>}
 */
export async function requireAppRole(
  requiredRoles: AppRole[]
): Promise<
  { success: true; data: UserAuthData } | { success: false; error: string }
> {
  const authData = await getAuthenticatedUserAuthData();

  if (!authData) {
    return {
      success: false,
      error: "Acción no autorizada. Sesión no encontrada.",
    };
  }

  if (!requiredRoles.includes(authData.appRole)) {
    logger.warn(
      `[SEGURIDAD] Violación de permiso: Usuario ${
        authData.user.id
      } con rol '${authData.appRole}' intentó acceder a funcionalidad restringida a '${requiredRoles.join(
        ", "
      )}'.`
    );
    return { success: false, error: "Permiso denegado." };
  }

  return { success: true, data: authData };
}

/**
 * @async
 * @function requireWorkspacePermission
 * @description Verifica si el usuario autenticado posee uno de los roles de workspace requeridos
 *              en el workspace proporcionado. Si el usuario no tiene el permiso, retorna un objeto de error.
 * @param {string} workspaceId - El ID del workspace a ser verificado.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles de workspace permitidos.
 * @returns {Promise<{ success: true, data: UserAuthData } | { success: false, error: string }>}
 */
export async function requireWorkspacePermission(
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<
  { success: true; data: UserAuthData } | { success: false; error: string }
> {
  const authData = await getAuthenticatedUserAuthData();

  if (!authData) {
    return {
      success: false,
      error: "Acción no autorizada. Sesión no encontrada.",
    };
  }

  const isAuthorized = await hasWorkspacePermission(
    authData.user.id,
    workspaceId,
    requiredRoles
  );

  if (!isAuthorized) {
    logger.warn(
      `[SEGURIDAD] Violación de permiso: Usuario ${
        authData.user.id
      } sin permiso de workspace ('${requiredRoles.join(
        ", "
      )}') en el workspace ${workspaceId}.`
    );
    return {
      success: false,
      error: "No tienes permiso para realizar esta acción en este workspace.",
    };
  }

  return { success: true, data: authData };
}

/**
 * @async
 * @function clearCachedAuthData
 * @description Limpia el cache de datos de autenticación para la próxima petición.
 *              Útil para pruebas o escenarios específicos donde el cache debe ser reseteado.
 */
// --- INICIO DE CORRECCIÓN ---
// Se añade la palabra clave `async` para cumplir con el contrato de `"use server";`.
export async function clearCachedAuthData() {
  // --- FIN DE CORRECCIÓN ---
  cachedUserAuthData = null;
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar el sistema de permisos.
 *
 * 1.  **Permisos Basados en Atributos (ABAC):** Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC. En lugar de solo roles, las funciones de `require` podrían aceptar condiciones más complejas, como `requirePermission({ action: 'delete', resource: 'site', condition: (site) => site.owner_id === user.id })`.
 * 2.  **Cache Distribuido (Redis/KV):** La memoización en `cachedUserAuthData` funciona por petición. Para un rendimiento a escala, los datos de sesión y permisos podrían ser cacheados en un almacén distribuido como Vercel KV o Upstash Redis, con un TTL (Time To Live) corto. Esto reduciría las lecturas a la base de datos en múltiples peticiones del mismo usuario.
 * 3.  **Sincronización de Cache con Webhooks:** Implementar un webhook de Supabase que, al actualizar la tabla `profiles` o `workspace_members`, invalide proactivamente la entrada de cache del usuario correspondiente en el cache distribuido, asegurando la consistencia de los datos de permisos.
 */
