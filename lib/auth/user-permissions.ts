// Ruta: lib/auth/user-permissions.ts
/**
 * @file lib/auth/user-permissions.ts
 * @description Este módulo es el "Guardián de Seguridad" de la aplicación. Centraliza todas
 *              las operaciones de obtención y verificación de roles y permisos de usuarios.
 *              Actúa como la única fuente de verdad para la autorización en todo el sistema.
 *              Las funciones públicas han sido explícitamente exportadas para asegurar
 *              su visibilidad y mockeabilidad en el entorno de pruebas.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.2.3 (Explicit Export Fix)
 */
"use server";

import { type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { sites as sitesData } from "@/lib/data"; // Aunque no se usa directamente aquí, se mantiene la importación si otras partes del snap la usan.
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

/**
 * @description Verifica si un usuario tiene uno de los roles requeridos en un workspace específico.
 *              Esta es una función auxiliar interna para el Guardián.
 * @param {string} userId - El UUID del usuario a verificar.
 * @param {string} workspaceId - El UUID del workspace en el que se requiere el permiso.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles que otorgan el permiso.
 * @returns {Promise<boolean>} Devuelve `true` si el usuario tiene el permiso, `false` en caso contrario.
 */
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
      // PGRST116: 'Not Found' (no se encontró miembro), no es un error de sistema.
      logger.error(
        `Error al verificar permisos para user ${userId} en workspace ${workspaceId}:`,
        error
      );
    }
    return false;
  }
  return requiredRoles.includes(member.role);
}

// --- Aparatos Públicos del Guardián (Asegurarse de que están exportados) ---

/**
 * @async
 * @function getAuthenticatedUserAuthData
 * @description Obtiene todos los datos de autenticación y autorización del usuario actual,
 *              incluyendo su rol de aplicación y su rol en el workspace activo.
 *              Los datos se cachean por petición para optimizar el rendimiento.
 * @returns {Promise<UserAuthData | null>} Un objeto `UserAuthData` si el usuario está autenticado y se encuentra su perfil, de lo contrario `null`.
 */
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

/**
 * @async
 * @function requireAppRole
 * @description Comprueba si el usuario autenticado tiene uno de los roles de aplicación requeridos.
 *              Es útil para proteger rutas de alto nivel (ej. `/admin`, `/dev-console`) o acciones globales.
 * @param {AppRole[]} requiredRoles - Un array de roles de aplicación que permiten el acceso.
 * @returns {Promise<{ success: true; data: UserAuthData } | { success: false; error: string }>} Un objeto indicando el éxito y los datos del usuario, o el fallo con un mensaje de error.
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

/**
 * @async
 * @function requireWorkspacePermission
 * @description Comprueba si el usuario autenticado tiene uno de los roles requeridos en un workspace específico.
 *              Es útil para proteger acciones o recursos vinculados a un workspace (ej. crear un sitio, editar una campaña).
 * @param {string} workspaceId - El ID del workspace para el cual se requieren los permisos.
 * @param {WorkspaceRole[]} requiredRoles - Un array de roles de workspace que permiten el acceso.
 * @returns {Promise<{ success: true; data: UserAuthData } | { success: false; error: string }>} Un objeto indicando el éxito y los datos del usuario, o el fallo con un mensaje de error.
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
      error: "Acción no autorizada. Sessión no encontrada.",
    };
  }

  // Verifica el permiso a nivel de workspace utilizando la función auxiliar interna.
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

/**
 * @function clearCachedAuthData
 * @description Elimina los datos de autenticación cacheada para forzar una nueva lectura en la próxima petición.
 *              Principalmente útil para entornos de pruebas.
 */
export function clearCachedAuthData() {
  // Added export keyword
  cachedUserAuthData = null;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Permisos Basados en Atributos (ABAC):** Para una granularidad aún mayor, el sistema podría evolucionar hacia un modelo ABAC (Attribute-Based Access Control). En lugar de solo roles, las funciones de `require` podrían aceptar condiciones más complejas basadas en atributos de la entidad (ej. `requirePermission({ action: 'delete', resource: 'site', condition: (site) => site.owner_id === user.id })`). Esto podría implicar el uso de librerías como `casl` o la creación de un motor de reglas interno.
 * 2.  **Cache Distribuido (Redis/KV):** La memoización `cachedUserAuthData` es efectiva por petición. Para un rendimiento a gran escala en un entorno distribuido (múltiples instancias del servidor), los datos de sesión y permisos podrían ser cacheados en un almacén distribuido como Vercel KV o Upstash Redis para reducir significativamente las lecturas de la base de datos en peticiones concurrentes del mismo usuario. Esto requeriría una capa de abstracción para el caché y una estrategia de invalidación.
 * 3.  **Sincronización de Cache con Webhooks/Eventos:** Si se implementa un caché distribuido, sería crucial un mecanismo para invalidar el caché de forma proactiva. Por ejemplo, al actualizar la tabla `profiles` o `workspace_members` (a través de Server Actions o funciones de base de datos), un webhook de Supabase o un evento interno podría disparar la invalidación de la entrada de caché del usuario correspondiente, asegurando la consistencia inmediata de los datos de permisos.
 * 4.  **Logging de Auditoría de Permisos Denegados:** Aunque ya se usa `logger.warn`, se podría integrar directamente con `lib/actions/_helpers/audit-log.helper.ts` para registrar los intentos fallidos de acceso por falta de permisos en la tabla `audit_logs`, proporcionando una trazabilidad de seguridad más completa.
 */
