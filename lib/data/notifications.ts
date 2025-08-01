// lib/data/notifications.ts
/**
 * @file notifications.ts
 * @description Aparato de datos canónico y especializado para todas las consultas
 *              relacionadas con la entidad 'notifications'. Esta es la ÚNICA fuente
 *              de verdad para acceder a los datos de notificaciones, garantizando
 *              seguridad, rendimiento y consistencia arquitectónica.
 * @author L.I.A. Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Initial Data Layer Creation)
 *
 * @see {@link file://./notifications.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la capa de datos de notificaciones.
 *
 * 1.  **Paginación**: La función actual obtiene todas las notificaciones no leídas. Para usuarios con un gran volumen de actividad, implementar paginación (`getPaginatedUnreadNotifications`) será crucial para el rendimiento del panel de notificaciones.
 * 2.  **Función de Archivo**: Crear una función `archiveReadNotifications(userId)` que mueva las notificaciones leídas más antiguas de X días a una tabla de archivo para mantener la tabla principal optimizada.
 * 3.  **Optimización de Consultas con Joins**: Enriquecer la consulta para que, en un solo viaje a la base de datos, obtenga datos del 'actor' (como `full_name` y `avatar_url` desde la tabla `profiles`), previniendo "waterfalls" de peticiones en la capa de UI.
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type Tables } from "@/lib/types/database";

export type Notification = Tables<"notifications">;

/**
 * @async
 * @function getUnreadNotificationsByUserId
 * @description Obtiene todas las notificaciones no leídas para un usuario específico,
 *              ordenadas por las más recientes primero.
 * @param {string} userId - El UUID del usuario para el cual se obtienen las notificaciones.
 * @returns {Promise<Notification[]>} Una promesa que resuelve a un array de notificaciones.
 * @throws {Error} Si la consulta a la base de datos falla.
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
      `[DataLayer:Notifications] Error al obtener notificaciones para el usuario ${userId}:`,
      error
    );
    throw new Error("No se pudieron obtener las notificaciones.");
  }

  return data || [];
}
// lib/data/notifications.ts
