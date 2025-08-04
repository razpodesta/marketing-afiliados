// lib/auth/user-permissions.ts
/**
 * @file user-permissions.ts
 * @description Guardián de seguridad centralizado y Única Fuente de Verdad para
 *              el contexto de sesión del usuario. Proporciona funciones de alto
 *              nivel para una autorización declarativa y segura.
 * @author L.I.A. Legacy
 * @version 6.0.0 (Session Context Enrichment)
 */
"use server";
import "server-only";

import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { getSiteById, type SiteBasicInfo } from "@/lib/data/sites";
import { logger } from "@/lib/logging";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type AppRole = Database["public"]["Enums"]["app_role"];
type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

/**
 * @typedef {object} UserAuthData
 * @description El contrato de datos canónico para el contexto de sesión de un usuario.
 *              Combina la identidad del usuario, su rol global y su contexto de trabajo activo.
 */
export type UserAuthData = {
  user: User;
  appRole: AppRole;
  activeWorkspaceId: string | null;
};

/**
 * @typedef {object} AuthResult
 * @description Un tipo de unión discriminada para los resultados de las funciones de autorización.
 *              Garantiza un manejo de errores y éxitos seguro en cuanto a tipos.
 */
type AuthResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: "SESSION_NOT_FOUND" | "PERMISSION_DENIED" | "NOT_FOUND";
    };

/**
 * @async
 * @function getAuthenticatedUserAuthData
 * @description Obtiene el contexto de sesión completo para el usuario actual.
 *              Es la única función en el sistema responsable de ensamblar este objeto.
 * @returns {Promise<UserAuthData | null>} El objeto de datos de autenticación o null si no hay sesión.
 */
export async function getAuthenticatedUserAuthData(): Promise<UserAuthData | null> {
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

/**
 * @async
 * @function requireAppRole
 * @description Guardián de seguridad que exige que el usuario actual tenga uno de los roles de aplicación especificados.
 * @param {AppRole[]} requiredRoles - Un array de roles de aplicación requeridos.
 * @returns {Promise<AuthResult<UserAuthData>>} El resultado de la comprobación de autorización.
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
 * @async
 * @function requireWorkspacePermission
 * @description Guardián de seguridad que exige que el usuario actual tenga uno de los roles de workspace especificados.
 * @param {string} workspaceId - El ID del workspace en el que se requiere el permiso.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles de workspace requeridos.
 * @returns {Promise<AuthResult<User>>} El resultado de la comprobación de autorización.
 */
export async function requireWorkspacePermission(
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<AuthResult<User>> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "SESSION_NOT_FOUND" };
  }

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
 * @async
 * @function requireSitePermission
 * @description Guardián de seguridad de alto nivel que exige que el usuario actual tenga permisos sobre un sitio específico.
 * @param {string} siteId - El ID del sitio sobre el que se requiere el permiso.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles requeridos en el workspace que contiene el sitio.
 * @returns {Promise<AuthResult<{ user: User; site: SiteBasicInfo }>>} El resultado de la comprobación.
 */
export async function requireSitePermission(
  siteId: string,
  requiredRoles: WorkspaceRole[]
): Promise<AuthResult<{ user: User; site: SiteBasicInfo }>> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "SESSION_NOT_FOUND" };
  }

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
 * @subsection Mejoras Futuras
 * 1. **Guardián de Campaña (`requireCampaignPermission`)**: ((Vigente)) Crear un guardián de nivel aún más alto que verifique los permisos a nivel de campaña, componiendo la lógica de `requireSitePermission`.
 * 2. **Cacheo de `getAuthenticatedUserAuthData`**: ((Vigente)) Envolver la lógica de esta función con `unstable_cache` de Next.js, utilizando un tag de caché basado en el `userId`, para optimizar las comprobaciones de permisos repetitivas dentro del mismo ciclo de petición.
 *
 * @subsection Mejoras Implementadas
 * 1. **Contexto de Sesión Enriquecido**: ((Implementada)) El tipo `UserAuthData` y la función que lo genera ahora incluyen el `activeWorkspaceId`, creando una fuente de verdad completa para el contexto de sesión y resolviendo el error `TS2339`.
 */
// lib/auth/user-permissions.ts
