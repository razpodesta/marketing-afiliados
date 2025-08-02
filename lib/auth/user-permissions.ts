// lib/auth/user-permissions.ts
/**
 * @file lib/auth/user-permissions.ts
 * @description Este módulo es el **Guardián de Seguridad** de la aplicación. Centraliza todas
 *              las operaciones de obtención y verificación de roles y permisos de usuarios.
 *              Actúa como la única fuente de verdad para la autorización en todo el sistema.
 *              Su diseño con memoización por petición optimiza el rendimiento al evitar
 *              consultas redundantes a la base de datos dentro del mismo ciclo de vida de una petición.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 2.3.0 (Enhanced Error Specificity & Documentation)
 * @see {@link file://./user-permissions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @functionality
 * - **`getAuthenticatedUserAuthData`**: Obtiene y cachea los datos de sesión completos
 *   (usuario, rol de aplicación, rol de workspace activo) para una única petición del servidor.
 * - **`requireAppRole`**: Función guardiana que valida si el usuario actual tiene un rol
 *   de aplicación específico (ej. 'developer'). Devuelve un `AuthResult` tipado.
 * - **`requireWorkspacePermission`**: Función guardiana que valida si el usuario tiene un
 *   rol específico dentro de un workspace determinado.
 *
 * @relationships
 * - Es consumido por Server Actions y Server Components protegidos (ej. `dev-console/layout.tsx`)
 *   para implementar la lógica de autorización.
 * - Depende de `lib/supabase/server.ts` para acceder a la base de datos.
 *
 * @expectations
 * - Se espera que este módulo sea la única vía para realizar comprobaciones de permisos.
 *   Su contrato de retorno (`AuthResult`) debe ser manejado por todos sus consumidores
 *   para garantizar un flujo de control seguro y predecible.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el guardián de seguridad.
 *
 * 1.  **Permisos Basados en Atributos (ABAC):** (Vigente) Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC (Attribute-Based Access Control).
 * 2.  **Cache Distribuido (Redis/KV):** (Vigente) La memoización `cachedUserAuthData` es efectiva por petición. Para un rendimiento a gran escala, los datos podrían ser cacheados en un almacén distribuido.
 * 3.  **Logging de Auditoría de Permisos Denegados:** (Vigente) Integrar con `audit-log.helper.ts` para registrar los intentos fallidos de acceso.
 */
"use server";

import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

type AppRole = Database["public"]["Enums"]["app_role"];
type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

export type UserAuthData = {
  user: User;
  appRole: AppRole;
  activeWorkspaceRole: WorkspaceRole | null;
  activeWorkspaceId: string | null;
};

let cachedUserAuthData: UserAuthData | null = null;

async function hasWorkspacePermission(
  userId: string,
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<boolean> {
  const supabase = createClient();
  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(
        `Error al verificar permisos para user ${userId} en workspace ${workspaceId}:`,
        error
      );
    }
    return false;
  }
  return requiredRoles.includes(member.role);
}

export async function getAuthenticatedUserAuthData(): Promise<UserAuthData | null> {
  if (cachedUserAuthData) {
    logger.trace(
      "[UserPermissions] Datos del usuario cargados desde el cache de la petición."
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
      `[UserPermissions] Error crítico: No se encontró perfil para el usuario ${user.id}:`,
      profileError
    );
    return null;
  }

  const activeWorkspaceId = cookies().get("active_workspace_id")?.value || null;
  let activeWorkspaceRole: WorkspaceRole | null = null;

  if (activeWorkspaceId) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("workspace_id", activeWorkspaceId)
      .single();
    if (member) {
      activeWorkspaceRole = member.role;
    }
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

export type AuthResult =
  | { success: true; data: UserAuthData }
  | { success: false; error: "SESSION_NOT_FOUND" | "PERMISSION_DENIED" };

export async function requireAppRole(
  requiredRoles: AppRole[]
): Promise<AuthResult> {
  const authData = await getAuthenticatedUserAuthData();
  if (!authData) {
    return {
      success: false,
      error: "SESSION_NOT_FOUND",
    };
  }
  if (!requiredRoles.includes(authData.appRole)) {
    logger.warn(
      `[SEGURIDAD] Violación de permiso: Usuario ${authData.user.id} con rol '${authData.appRole}' intentó acceder a una funcionalidad restringida para '${requiredRoles.join(", ")}'.`
    );
    return { success: false, error: "PERMISSION_DENIED" };
  }
  return { success: true, data: authData };
}

export async function requireWorkspacePermission(
  workspaceId: string,
  requiredRoles: WorkspaceRole[]
): Promise<AuthResult> {
  const authData = await getAuthenticatedUserAuthData();
  if (!authData) {
    return {
      success: false,
      error: "SESSION_NOT_FOUND",
    };
  }

  const isAuthorized = await hasWorkspacePermission(
    authData.user.id,
    workspaceId,
    requiredRoles
  );
  if (!isAuthorized) {
    logger.warn(
      `[SEGURIDAD] Violación de permiso de workspace: Usuario ${authData.user.id} intentó una acción que requiere '${requiredRoles.join(", ")}' en el workspace ${workspaceId}.`
    );
    return {
      success: false,
      error: "PERMISSION_DENIED",
    };
  }

  return { success: true, data: authData };
}

export async function clearCachedAuthData() {
  cachedUserAuthData = null;
}
// lib/auth/user-permissions.ts
