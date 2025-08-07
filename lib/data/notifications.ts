// lib/data/notifications.ts
/**
 * @file lib/data/notifications.ts
 * @description Aparato de datos canónico para notificaciones e invitaciones.
 *              Este módulo ha sido refactorizado para utilizar correctamente el patrón
 *              de inyección de dependencias, asegurando la compatibilidad con
 *              funciones cacheadas de Next.js y mejorando la testeabilidad.
 *              Es la única fuente de verdad para obtener datos de notificaciones.
 *
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Canonical Dependency Injection & TSDoc)
 */
"use server";
import "server-only";

import { logger } from "@/lib/logging";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";
import { type SupabaseClient } from "@supabase/supabase-js";

// --- Tipos de Contrato de Datos ---

/**
 * @typedef Supabase
 * @description Tipo genérico para una instancia del cliente de Supabase,
 *              utilizado para la inyección de dependencias.
 */
type Supabase = SupabaseClient<any, "public", any>;

/**
 * @typedef Notification
 * @description Representa la forma de una fila en la tabla `notifications`.
 */
export type Notification = Tables<"notifications">;

/**
 * @private
 * @typedef RawInvitationData
 * @description Tipo interno que representa la forma cruda de los datos de una
 *              invitación como son devueltos por la consulta a Supabase,
 *              antes de la transformación.
 */
type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

/**
 * @typedef Invitation
 * @description Representa el contrato de datos limpio y transformado para una
 *              invitación, tal como lo consumirá la interfaz de usuario.
 */
export type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

// --- Funciones de Acceso a Datos ---

/**
 * Obtiene y transforma todas las invitaciones pendientes para un email de usuario.
 * @async
 * @function getPendingInvitationsByEmail
 * @param {string} userEmail - El email del usuario para buscar invitaciones.
 * @param {Supabase} [supabaseClient] - Instancia opcional del cliente de Supabase
 *                   para ser usada dentro de funciones cacheadas o transacciones.
 *                   Si no se provee, se creará una nueva instancia.
 * @returns {Promise<Invitation[]>} Una promesa que resuelve a un array de invitaciones
 *                                  limpias y listas para ser consumidas por la UI.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getPendingInvitationsByEmail(
  userEmail: string,
  supabaseClient?: Supabase
): Promise<Invitation[]> {
  const supabase = supabaseClient || createServerClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, status, workspaces (name, icon)")
    .eq("invitee_email", userEmail)
    .eq("status", "pending");

  if (error) {
    logger.error(
      `[DataLayer:Notifications] Error al obtener invitaciones para ${userEmail}:`,
      error
    );
    throw new Error("No se pudieron cargar las invitaciones.");
  }

  const pendingInvitations: Invitation[] =
    (data as RawInvitationData[])?.map((inv) => ({
      id: inv.id,
      status: inv.status,
      workspaces: Array.isArray(inv.workspaces)
        ? inv.workspaces[0] || null
        : inv.workspaces,
    })) || [];

  return pendingInvitations;
}

/**
 * Obtiene todas las notificaciones no leídas para un usuario específico.
 * @async
 * @function getUnreadNotificationsByUserId
 * @param {string} userId - El UUID del usuario.
 * @param {Supabase} [supabaseClient] - Instancia opcional del cliente de Supabase.
 * @returns {Promise<Notification[]>} Una promesa que resuelve a un array de notificaciones.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
export async function getUnreadNotificationsByUserId(
  userId: string,
  supabaseClient?: Supabase
): Promise<Notification[]> {
  const supabase = supabaseClient || createServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      `[DataLayer:Notifications] Error al obtener notificaciones para ${userId}:`,
      error
    );
    throw new Error("No se pudieron obtener las notificaciones.");
  }

  return data || [];
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Inyección de Dependencias Canónica**: ((Implementada)) Se ha consolidado el patrón de inyección de dependencias, permitiendo que ambas funciones operen de forma segura dentro de funciones cacheadas como `unstable_cache`. Esto resuelve la violación de caché.
 * 2. **Documentación TSDoc Exhaustiva**: ((Implementada)) Se ha añadido documentación TSDoc completa para el módulo, tipos y funciones, mejorando la mantenibilidad y claridad del código.
 * 3. **Tipado Explícito y Robusto**: ((Implementada)) Se han definido tipos explícitos como `RawInvitationData` y `Invitation` para clarificar el proceso de transformación de datos y fortalecer los contratos internos del módulo.
 *
 * @subsection Melhorias Futuras
 * 1. **Paginación para Notificaciones**: ((Vigente)) Implementar paginación para `getUnreadNotificationsByUserId` para manejar de forma eficiente un gran volumen de notificaciones sin impactar el rendimiento.
 * 2. **Función `markAsRead`**: ((Vigente)) Crear una nueva función `markNotificationAsRead(notificationId, userId)` que actualice el campo `read_at` de una notificación, asegurando que el `userId` coincida para la autorización.
 */
// lib/data/notifications.ts
