// lib/auth/user-permissions.ts
/**
 * @file lib/auth/user-permissions.ts
 * @description Este módulo es el "Guardián de Seguridad" de la aplicación. Centraliza todas
 *              las operaciones de obtención y verificación de roles y permisos de usuarios.
 *              Actúa como la única fuente de verdad para la autorización en todo el sistema.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 2.2.4 (Async Export for Server Module Compliance)
 * @see {@link file://./user-permissions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el guardián de seguridad.
 *
 * 1.  **Permisos Basados en Atributos (ABAC):** (Vigente) Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC (Attribute-Based Access Control). En lugar de solo roles, las funciones de `require` podrían aceptar condiciones más complejas.
 * 2.  **Cache Distribuido (Redis/KV):** (Vigente) La memoización `cachedUserAuthData` es efectiva por petición. Para un rendimiento a gran escala, los datos de sesión y permisos podrían ser cacheados en un almacén distribuido como Vercel KV o Upstash Redis.
 * 3.  **Logging de Auditoría de Permisos Denegados:** (Vigente) Integrar directamente con `lib/actions/_helpers/audit-log.helper.ts` para registrar los intentos fallidos de acceso por falta de permisos en la tabla `audit_logs`.
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

export async function requireAppRole(
  requiredRoles: AppRole[]
): Promise<
  { success: true; data: UserAuthData } | { success: false; error: string }
> {
  const authData = await getAuthenticatedUserAuthData();
  if (!authData) {
    return {
      success: false,
      error: "Acción no autorizada. Sessión no encontrada.",
    };
  }
  if (!requiredRoles.includes(authData.appRole)) {
    logger.warn(
      `[SEGURIDAD] Violación de permiso: Usuario ${authData.user.id} con rol '${authData.appRole}' intentó acceder a una funcionalidad restringida para '${requiredRoles.join(", ")}'.`
    );
    return { success: false, error: "Permiso denegado." };
  }
  return { success: true, data: authData };
}

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
      error: "Acción no autorizada. Sessión no encontrada.",
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
      error: "No tienes permiso para realizar esta acción en este workspace.",
    };
  }

  return { success: true, data: authData };
}

export async function clearCachedAuthData() {
  cachedUserAuthData = null;
}
// lib/auth/user-permissions.ts
