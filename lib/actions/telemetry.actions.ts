// lib/actions/telemetry.actions.ts
/**
 * @file telemetry.actions.ts
 * @description Contiene Server Actions para la recolección de datos de telemetría,
 *              como el registro de visitantes para inteligencia y prevención de fraude.
 * @author L.I.A Legacy
 * @version 1.0.0
 * @see {@link file://./telemetry.actions.test.ts} Para el arnés de pruebas correspondiente.
 */
"use server";

import { ZodError } from "zod";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, VisitorLogSchema } from "@/lib/validators";

/**
 * @async
 * @function logVisitorAction
 * @description Registra la información de un nuevo visitante en la base de datos.
 *              Esta acción está diseñada para ser llamada una vez por sesión anónima.
 * @param {object} payload - Los datos del visitante a registrar.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación.
 */
export async function logVisitorAction(
  payload: unknown
): Promise<ActionResult<void>> {
  try {
    const validatedData = VisitorLogSchema.parse(payload);
    const { sessionId, fingerprint, ipAddress, geoData, userAgent, utmParams } =
      validatedData;

    const supabase = createClient();
    const { error } = await supabase.from("visitor_logs").insert({
      session_id: sessionId,
      fingerprint,
      ip_address: ipAddress,
      geo_data: geoData,
      user_agent: userAgent,
      utm_params: utmParams,
    });

    if (error) {
      logger.error("[TelemetryAction] Error al registrar visitante:", error);
      return { success: false, error: "No se pudo registrar la visita." };
    }

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn(
        "[TelemetryAction] Intento de log con datos inválidos:",
        error.flatten()
      );
      return { success: false, error: "Datos de visitante inválidos." };
    }
    logger.error("[TelemetryAction] Error inesperado:", error);
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la capa de acciones de telemetría.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Detección de Duplicados**: (Vigente) Antes de insertar, la acción podría verificar si ya existe un log con el mismo `sessionId` para evitar registros duplicados en caso de race conditions.
 * 2. **Enriquecimiento de Datos en Servidor**: (Vigente) La acción podría enriquecer los datos recibidos. Por ejemplo, podría usar la IP para realizar una segunda verificación de geolocalización en el servidor como medida de seguridad.
 * 3. **Procesamiento Asíncrono**: (Vigente) Para una máxima performance en el middleware, esta acción podría, en lugar de escribir directamente en la base de datos, enviar los datos a una cola de procesamiento (como Inngest o Supabase Edge Functions) que se encargue de la escritura de forma asíncrona.
 */
// lib/actions/telemetry.actions.ts
