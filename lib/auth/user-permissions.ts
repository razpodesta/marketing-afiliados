// Ruta: lib/auth/user-permissions.ts
/**
 * @file lib/auth/user-permissions.ts
 * @description Este módulo es el "Guardián de Seguridad" de la aplicación. Centraliza todas
 *              las operaciones de obtención y verificación de roles y permisos de usuarios.
 *              Actúa como la única fuente de verdad para la autorización en todo el sistema.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.2.2 (Final Return Path Fix & Module Restoration)
 */
"use server";

import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { sites as sitesData } from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Database } from "@/lib/types/database";

// --- Tipos de Contrato de Datos ---

type AppRole = Database["public"]["Enums"]["app_role"];
type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

export type UserAuthData = {
  user: User;
  appRole: AppRole;
  activeWorkspaceRole: WorkspaceRole | null;
  activeWorkspaceId: string | null;
};

// --- Estrategia de Cache por Petición ---

let cachedUserAuthData: UserAuthData | null = null;

// --- Funciones Auxiliares Internas ---

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

// --- Aparatos Públicos del Guardián ---

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
      error: "Acción no autorizada. Sesión no encontrada.",
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar el sistema de permisos.
 *
 * 1.  **Permisos Basados en Atributos (ABAC):** (Revalidado) Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC, permitiendo condiciones de permiso más complejas que solo roles estáticos.
 * 2.  **Cache Distribuido (Redis/KV):** (Revalidado) Para un rendimiento a gran escala, los datos de sesión y permisos podrían ser cacheados en un almacén distribuido como Vercel KV o Upstash Redis para reducir las lecturas de la base de datos en múltiples peticiones del mismo usuario.
 * 3.  **Sincronización de Cache con Webhooks:** (Revalidado) Implementar un webhook de Supabase que, al actualizar la tabla `profiles` o `workspace_members`, invalide proactivamente la entrada de caché del usuario correspondiente, asegurando la consistencia de los datos de permisos.
 */

/**
 * @fileoverview El Guardián de Permisos (`user-permissions.ts`) es el único responsable de la lógica de autorización.
 * @functionality
 * - Obtiene y cachea de forma segura los datos de sesión y roles del usuario por petición.
 * - Proporciona funciones "guardianas" (`require...`) que actúan como puntos de control de seguridad, devolviendo un objeto de resultado tipado que indica éxito o fallo.
 * - Encapsula la lógica de comprobación de permisos de bajo nivel, desacoplando el resto de la aplicación de los detalles de la estructura de la base de datos.
 * @relationships
 * - Es la dependencia principal del `middleware.ts` para proteger rutas.
 * - Es consumido por todas las Server Actions en `lib/actions/` que realizan operaciones sensibles.
 * @expectations
 * - Se espera que este aparato sea infalible. Cualquier fallo en su lógica podría comprometer la seguridad de toda la aplicación. Debe ser rigurosamente testeado y su API debe ser lo más simple y explícita posible para minimizar el riesgo de un uso incorrecto.
 */
// Ruta: lib/auth/user-permissions.ts
/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar el sistema de permisos.
 *
 * 1.  **Permisos Basados en Atributos (ABAC):** Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC. En lugar de solo roles, las funciones de `require` podrían aceptar condiciones más complejas, como `requirePermission({ action: 'delete', resource: 'site', condition: (site) => site.owner_id === user.id })`.
 * 2.  **Cache Distribuido (Redis/KV):** La memoización en `cachedUserAuthData` funciona por petición. Para un rendimiento a escala, los datos de sesión y permisos podrían ser cacheados en un almacén distribuido como Vercel KV o Upstash Redis, con un TTL (Time To Live) corto. Esto reduciría las lecturas a la base de datos en múltiples peticiones del mismo usuario.
 * 3.  **Sincronización de Cache con Webhooks:** Implementar un webhook de Supabase que, al actualizar la tabla `profiles` o `workspace_members`, invalide proactivamente la entrada de cache del usuario correspondiente en el cache distribuido, asegurando la consistencia de los datos de permisos.
 */
