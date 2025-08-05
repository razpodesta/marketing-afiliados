// lib/auth/user-permissions.ts
/**
 * @file user-permissions.ts
 * @description Guardián de seguridad de élite y Única Fuente de Verdad para la
 *              autorización y el contexto de sesión en el entorno de SERVIDOR (Node.js).
 *              Utiliza `React.cache` para memoizar la obtención de la sesión por petición,
 *              garantizando un rendimiento máximo.
 * @author L.I.A. Legacy
 * @version 7.0.0 (Request-Memoized Session Context)
 */
"use server";
import "server-only";

import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { getSiteById, type SiteBasicInfo } from "@/lib/data/sites";
import { logger } from "@/lib/logging";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type AppRole = Database["public"]["Enums"]["app_role"];
type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @typedef UserAuthData
 * @description Contrato de datos que representa el contexto de sesión completo
 *              y memoizado para un usuario autenticado.
 */
export type UserAuthData = {
  user: User;
  appRole: AppRole;
  activeWorkspaceId: string | null;
};

/**
 * @typedef AuthResult<T>
 * @description Tipo de unión discriminada para los resultados de las funciones de
 *              autorización. Garantiza un manejo de errores explícito y seguro.
 */
type AuthResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: "SESSION_NOT_FOUND" | "PERMISSION_DENIED" | "NOT_FOUND";
    };

/**
 * @public
 * @async
 * @function getAuthenticatedUserAuthData
 * @description Obtiene el contexto de sesión completo del usuario para la petición actual.
 *              Gracias a `React.cache`, las consultas a la base de datos solo se
 *              ejecutarán una vez, incluso si esta función es llamada múltiples veces
 *              durante un único ciclo de renderizado del servidor.
 * @returns {Promise<UserAuthData | null>} El contexto de sesión memoizado o null.
 */
export const getAuthenticatedUserAuthData = cache(
  async (): Promise<UserAuthData | null> => {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const cookieStore = cookies();
    const { data: profile } = await supabase
      .from("profiles")
      .select("app_role")
      .eq("id", user.id)
      .single();

    return {
      user,
      appRole: profile?.app_role || "user",
      activeWorkspaceId: cookieStore.get("active_workspace_id")?.value || null,
    };
  }
);

/**
 * @public
 * @async
 * @function requireAppRole
 * @description Guardián de seguridad que verifica si el usuario actual tiene uno
 *              de los roles de aplicación requeridos.
 * @param {AppRole[]} requiredRoles - Un array de roles permitidos.
 * @returns {Promise<AuthResult<UserAuthData>>} El resultado de la autorización.
 */
export async function requireAppRole(
  requiredRoles: AppRole[]
): Promise<AuthResult<UserAuthData>> {
  const authData = await getAuthenticatedUserAuthData();

  if (!authData) {
    return { success: false, error: "SESSION_NOT_FOUND" };
  }

  if (!requiredRoles.includes(authData.appRole)) {
    return { success: false, error: "PERMISSION_DENIED" };
  }

  return { success: true, data: authData };
}

/**
 * @public
 * @async
 * @function requireWorkspacePermission
 * @description Guardián de seguridad que verifica si el usuario actual tiene
 *              permisos específicos dentro de un workspace.
 * @param {string} workspaceId - El ID del workspace a verificar.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles permitidos.
 * @returns {Promise<AuthResult<User>>} El resultado de la autorización.
 */
export async function requireWorkspacePermission(
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<AuthResult<User>> {
  const authData = await getAuthenticatedUserAuthData();

  if (!authData) {
    return { success: false, error: "SESSION_NOT_FOUND" };
  }
  const { user } = authData;

  const isAuthorized = await hasWorkspacePermission(
    user.id,
    workspaceId,
    requiredRoles
  );

  if (!isAuthorized) {
    logger.warn(
      `[requireWorkspacePermission] VIOLACIÓN DE ACCESO: Usuario ${user.id} en workspace ${workspaceId}.`
    );
    return { success: false, error: "PERMISSION_DENIED" };
  }

  return { success: true, data: user };
}

/**
 * @public
 * @async
 * @function requireSitePermission
 * @description Guardián de seguridad de alto nivel que verifica si el usuario
 *              actual tiene permisos sobre un sitio específico, comprobando su
 *              pertenencia y rol en el workspace padre.
 * @param {string} siteId - El ID del sitio a verificar.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles permitidos en el workspace.
 * @returns {Promise<AuthResult<{ user: User; site: SiteBasicInfo }>>} El resultado.
 */
export async function requireSitePermission(
  siteId: string,
  requiredRoles: WorkspaceRole[]
): Promise<AuthResult<{ user: User; site: SiteBasicInfo }>> {
  const authData = await getAuthenticatedUserAuthData();

  if (!authData) {
    return { success: false, error: "SESSION_NOT_FOUND" };
  }
  const { user } = authData;

  const site = await getSiteById(siteId);
  if (!site) {
    return { success: false, error: "NOT_FOUND" };
  }

  const isAuthorized = await hasWorkspacePermission(
    user.id,
    site.workspace_id,
    requiredRoles
  );

  if (!isAuthorized) {
    logger.warn(
      `[requireSitePermission] VIOLACIÓN DE ACCESO: Usuario ${user.id} al sitio ${siteId}.`
    );
    return { success: false, error: "PERMISSION_DENIED" };
  }

  return { success: true, data: { user, site } };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cacheo de Sesión por Petición**: ((Implementada)) Se mantiene el uso de `React.cache` para un rendimiento óptimo en el entorno de servidor Node.js.
 *
 * @subsection Melhorias Futuras
 * 1. **Guardián de Campaña (`requireCampaignPermission`)**: ((Vigente)) Crear un guardián de nivel aún más alto que verifique los permisos a nivel de campaña.
 */
// lib/auth/user-permissions.ts
