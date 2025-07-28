// Ruta: app/actions/_helpers/audit-log.helper.ts
/**
 * @file audit-log.helper.ts
 * @description Helper centralizado para registrar eventos de auditoría en la base de datos.
 *
 * @author Metashark
 * @version 1.0.0
 */
"use server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * @description Registra un evento de auditoría en la base de datos.
 * @param {string} action - El nombre de la acción realizada.
 * @param {{ userId?: string; [key: string]: any }} details - Datos adicionales sobre el evento.
 */
export async function createAuditLog(
  action: string,
  details: { userId?: string; [key: string]: any }
) {
  try {
    const supabase = createClient();
    const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";

    const { error } = await supabase.from("audit_logs").insert({
      action,
      user_id: details.userId,
      details,
      ip_address: ip,
    });
    if (error) {
      logger.error("[AuditLog] No se pudo guardar el log de auditoría:", error);
    }
  } catch (e) {
    logger.error("[AuditLog] Fallo crítico al intentar guardar el log:", e);
  }
}
