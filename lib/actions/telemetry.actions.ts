// lib/actions/telemetry.actions.ts
/**
 * @file telemetry.actions.ts
 * @description Contiene Server Actions para la recolección de datos de telemetría.
 *              Ha sido refactorizado para cumplir con el contrato de tipo estricto (`snake_case`)
 *              del esquema de validación y la base de datos, resolviendo todos los errores
 *              de compilación relacionados con la nomenclatura y nulidad de propiedades.
 * @author L.I.A Legacy
 * @version 12.0.0 (Strict Contract Compliance)
 */
"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type TablesInsert } from "@/lib/types/database";
import { type ActionResult, ClientVisitSchema } from "@/lib/validators";

/**
 * Registra o actualiza los datos de una visita de cliente. Esta acción es
 * invocada desde el navegador para enriquecer un log de sesión iniciado
 * por el middleware con datos que solo el cliente conoce (ej. fingerprint,
 * resolución de pantalla).
 * @public
 * @async
 * @function logClientVisitAction
 * @param {unknown} payload - Los datos del cliente. Se espera que cumplan con `ClientVisitSchema`.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación.
 */
export async function logClientVisitAction(
  payload: unknown
): Promise<ActionResult<void>> {
  try {
    const validatedData = ClientVisitSchema.parse(payload);
    const {
      sessionId,
      fingerprint,
      screenWidth,
      screenHeight,
      userAgentClientHint,
    } = validatedData;

    const finalSessionId = sessionId || randomUUID();
    const supabase = createClient();
    const headersList = headers();
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    // --- INÍCIO DA CORREÇÃO DE CONTRATO ---
    // O payload para a tabela `visitor_logs` requer `fingerprint` e `session_id`.
    // Não usamos `Partial` para garantir que o contrato seja cumprido.
    // Os campos opcionais são adicionados condicionalmente.
    const clientLogData: TablesInsert<"visitor_logs"> = {
      session_id: finalSessionId,
      fingerprint: fingerprint, // Campo obrigatório
      ip_address: ipAddress,
      browser_context: {
        screenWidth,
        screenHeight,
        userAgentClientHint,
      },
    };
    // --- FIM DA CORREÇÃO DE CONTRATO ---

    const { error } = await supabase
      .from("visitor_logs")
      .upsert(clientLogData, { onConflict: "session_id" });

    if (error) {
      logger.error("[TelemetryAction] Error al registrar visita de cliente:", {
        error: error.message,
        details: error.details,
      });
      return { success: false, error: "No se pudo registrar la visita." };
    }

    logger.info("[TelemetryAction] Visita de cliente registrada/actualizada.", {
      sessionId: finalSessionId,
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn(
        "[TelemetryAction] Datos de visita de cliente inválidos:",
        error.flatten()
      );
      return { success: false, error: "Datos de cliente inválidos." };
    }
    logger.error(
      "[TelemetryAction] Error inesperado en logClientVisitAction:",
      error
    );
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Cumprimento de Contrato Estrito**: ((Implementada)) Se ha eliminado el uso de `Partial<>`. El payload `clientLogData` ahora se construye como `TablesInsert<'visitor_logs'>`, garantizando que todos los campos obligatorios (como `fingerprint`) estén siempre presentes. Esto resuelve definitivamente el error de compilación `TS2769`.
 * 2.  **Observabilidade Completa**: ((Implementada)) Se ha enriquecido el logging para incluir detalles de errores de Zod y de la base de datos, proporcionando una visibilidad completa del flujo de telemetría.
 *
 * @subsection Melhorias Futuras
 * 1.  **Enriquecimento de `user_id`**: ((Vigente)) La acción podría intentar obtener la sesión del usuario actual y, si existe, añadir el `user_id` al `visitor_log` para vincular las sesiones anónimas con los usuarios autenticados.
 */
// lib/actions/telemetry.actions.ts
