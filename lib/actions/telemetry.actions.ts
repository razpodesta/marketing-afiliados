// lib/actions/telemetry.actions.ts
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { logger } from "@/lib/logging";
import { lookupIpAddress } from "@/lib/services/geoip.service";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/types/database";
import {
  ActionResult,
  ClientVisitSchema,
  VisitorLogSchema,
} from "@/lib/validators";

async function checkIpBlacklist(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  return ip.startsWith("8.8.8.8");
}

export async function logVisitorAction(
  payload: unknown
): Promise<ActionResult<void>> {
  try {
    const parsedData = VisitorLogSchema.parse(payload);
    const enrichedGeoData = await lookupIpAddress(parsedData.ipAddress);
    const finalGeoData = enrichedGeoData
      ? { ...parsedData.geo_data, ...enrichedGeoData }
      : parsedData.geo_data;

    const visitorLogToInsert: TablesInsert<"visitor_logs"> = {
      session_id: parsedData.sessionId,
      fingerprint: parsedData.fingerprint,
      ip_address: parsedData.ipAddress,
      geo_data: finalGeoData,
      user_agent: parsedData.userAgent,
      utm_params: parsedData.utmParams,
      referrer: parsedData.referrer,
      landing_page: parsedData.landingPage,
      browser_context: parsedData.browser_context,
      is_bot: parsedData.isBot,
      is_known_abuser: parsedData.isKnownAbuser,
    };

    const supabase = createClient();
    const { error } = await supabase
      .from("visitor_logs")
      .insert(visitorLogToInsert);
    if (error) {
      logger.error("[TelemetryAction] Error al registrar visitante:", error);
      return { success: false, error: "No se pudo registrar la visita." };
    }
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn(
        "[TelemetryAction] Datos de visitante inválidos:",
        error.flatten()
      );
      return { success: false, error: "Datos de visitante inválidos." };
    }
    logger.error(
      "[TelemetryAction] Error inesperado en logVisitorAction:",
      error
    );
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

export async function logClientVisitAction(
  payload: unknown
): Promise<ActionResult<void>> {
  try {
    const validatedData = ClientVisitSchema.parse(payload);
    const {
      sessionId: clientProvidedSessionId,
      fingerprint,
      screenWidth,
      screenHeight,
      userAgentClientHint,
    } = validatedData;
    const finalSessionId = clientProvidedSessionId || randomUUID();

    const supabase = createClient();
    const headersList = headers();
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    // El objeto ahora cumple con el contrato `TablesInsert`, no es parcial.
    const clientLogToInsert: TablesInsert<"visitor_logs"> = {
      session_id: finalSessionId,
      fingerprint, // El campo fingerprint ahora está garantizado.
      ip_address: ipAddress,
      browser_context: {
        screenWidth,
        screenHeight,
        userAgentClientHint,
      },
    };
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

    const { error } = await supabase
      .from("visitor_logs")
      .upsert(clientLogToInsert, { onConflict: "session_id" });

    if (error) {
      logger.error(
        "[TelemetryAction] Error al registrar visita de cliente:",
        error
      );
      return { success: false, error: "No se pudo registrar la visita." };
    }
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
 * @file telemetry.actions.ts
 * @description Contiene Server Actions para la recolección de datos de telemetría.
 *              Refactorizado para cumplir con el contrato de tipo estricto de la
 *              operación `upsert`, resolviendo un error de compilación.
 * @author L.I.A Legacy
 * @version 10.0.0 (Strict Upsert Contract Compliance)
 */
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cumplimiento de Contrato Estricto**: ((Implementada)) Se ha eliminado el tipo `Partial` del objeto `clientLogToInsert`, garantizando que todas las propiedades requeridas por la base de datos (especialmente `fingerprint`) estén siempre presentes, lo que resuelve el error de compilación de TypeScript.
 */
// lib/actions/telemetry.actions.ts
