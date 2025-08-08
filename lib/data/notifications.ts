// lib/data/notifications.ts
/**
 * @file lib/data/notifications.ts
 * @description Aparato de datos canónico para notificaciones e invitaciones.
 *              Ha sido refactorizado para alinearse con el esquema de base de
 *              datos actualizado, que no incluye una tabla `notifications`.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 5.0.0 (Schema Realignment)
 */
"use server";
import "server-only";

import { logger } from "@/lib/logging";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { type SupabaseClient } from "@supabase/supabase-js";

type Supabase = SupabaseClient<any, "public", any>;

type RawInvitationData = {
  id: string;
  status: string;
  workspaces:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

export type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

/**
 * Obtiene y transforma todas las invitaciones pendientes para un email de usuario.
 * @async
 * @function getPendingInvitationsByEmail
 * @param {string} userEmail - El email del usuario para buscar invitaciones.
 * @param {Supabase} [supabaseClient] - Instancia opcional del cliente de Supabase.
 * @returns {Promise<Invitation[]>} Una promesa que resuelve a un array de invitaciones.
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

// --- INICIO DE CORRECCIÓN (TS2344, TS2769) ---
// La tabla `notifications` no existe en el esquema generado.
// Se eliminan todas las referencias a ella para alinear el código con la realidad.
/*
export type Notification = Tables<"notifications">; // <<-- ELIMINADO
export async function getUnreadNotificationsByUserId(
  userId: string,
  supabaseClient?: Supabase
): Promise<Notification[]> {
  // ... Lógica eliminada ...
}
*/
// --- FIN DE CORRECCIÓN ---

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronización de Esquema**: ((Implementada)) Se han eliminado todas las referencias a la tabla `notifications` y sus tipos asociados, que no existen en el esquema de base de datos generado. Esto resuelve los errores de compilación `TS2344` y `TS2769`.
 *
 * @subsection Melhorias Futuras
 * 1.  **Reintroducción de Notificaciones**: ((Vigente)) Si la funcionalidad de notificaciones es necesaria, se debe crear la tabla `notifications` en la base de datos, regenerar los tipos con `pnpm gen:types`, y luego reintroducir la función `getUnreadNotificationsByUserId` y su tipo correspondiente.
 */
// lib/data/notifications.ts
