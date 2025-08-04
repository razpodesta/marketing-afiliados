// lib/data/notifications.ts
/**
 * @file notifications.ts
 * @description Aparato de datos canónico para notificaciones e invitaciones.
 *              Ha sido refactorizado para encapsular la lógica de obtención
 *              de invitaciones pendientes, desacoplando esta complejidad del
 *              DashboardLayout y mejorando la arquitectura general del sistema.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 2.0.0 (Invitation Logic Abstraction)
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

export type Notification = Tables<"notifications">;

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---

// Tipo interno para la forma cruda de los datos de la invitación desde Supabase.
type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

// Tipo público que representa el contrato de datos limpio que la UI consumirá.
export type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

/**
 * @async
 * @function getPendingInvitationsByEmail
 * @description Obtiene y transforma todas las invitaciones pendientes para un email de usuario.
 * @param {string} userEmail - El email del usuario.
 * @returns {Promise<Invitation[]>} Una promesa que resuelve a un array de invitaciones limpias.
 * @throws {Error} Si la consulta falla.
 */
export async function getPendingInvitationsByEmail(
  userEmail: string
): Promise<Invitation[]> {
  const supabase = createClient();
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

  // Transforma los datos crudos a la forma limpia que espera la UI.
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

// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

/**
 * @async
 * @function getUnreadNotificationsByUserId
 * @description Obtiene todas las notificaciones no leídas para un usuario.
 * @param {string} userId - El UUID del usuario.
 * @returns {Promise<Notification[]>} Una promesa que resuelve a un array de notificaciones.
 * @throws {Error} Si la consulta falla.
 */
export async function getUnreadNotificationsByUserId(
  userId: string
): Promise<Notification[]> {
  const supabase = createClient();
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
 * @subsection Mejoras Futuras
 * 1. **Paginación**: ((Vigente)) Implementar paginación para `getUnreadNotificationsByUserId`.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Abstracción de Lógica de Invitaciones**: ((Implementada)) Se ha movido la lógica para obtener y transformar invitaciones pendientes a este módulo, mejorando la cohesión y la separación de responsabilidades.
 */
// lib/data/notifications.ts
