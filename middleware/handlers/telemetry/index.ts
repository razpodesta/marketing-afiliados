// middleware/handlers/telemetry/index.ts
/**
 * @file middleware/handlers/telemetry/index.ts
 * @description Manejador de middleware para la inteligencia de visitante.
 *              Ha sido enriquecido para capturar y almacenar datos de atribución,
 *              contexto del navegador y realizar una verificación de abuso de IP.
 * @author L.I.A Legacy
 * @version 4.0.0 (Enriched Telemetry & Security Check)
 */
import { type NextRequest, type NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";

// Simulación de una función que consulta una API de listas negras de IP.
// En un entorno real, esto haría una llamada a un servicio como AbuseIPDB.
async function checkIpBlacklist(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  // Lógica de placeholder. Se puede expandir para una llamada de API real.
  return ip.startsWith("8.8."); // Ejemplo: Marcar IPs de DNS públicos de Google como "abusadores".
}

export async function handleTelemetry(
  request: NextRequest,
  response: NextResponse
): Promise<void> {
  if (request.cookies.has("metashark_session_id")) {
    return;
  }

  try {
    const sessionId = self.crypto.randomUUID();
    const headers = request.headers;
    const ip = request.ip ?? "127.0.0.1";
    const userAgent = headers.get("user-agent") || "";

    // Simple bot detection
    const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(userAgent);
    const isKnownAbuser = await checkIpBlacklist(ip);

    const browserContext = {
      secChUa: headers.get("sec-ch-ua"),
      secChUaMobile: headers.get("sec-ch-ua-mobile"),
      secChUaPlatform: headers.get("sec-ch-ua-platform"),
      secChViewportWidth: headers.get("sec-ch-viewport-width"),
      saveData: headers.get("save-data"),
    };

    const logPayload = {
      session_id: sessionId,
      fingerprint: "server_side_fingerprint_placeholder",
      ip_address: ip,
      geo_data: request.geo,
      user_agent: userAgent,
      utm_params: Object.fromEntries(request.nextUrl.searchParams.entries()),
      referrer: headers.get("referer"),
      landing_page: request.nextUrl.pathname,
      browser_context: browserContext,
      is_bot: isBot,
      is_known_abuser: isKnownAbuser,
    };

    const { supabase } = await createClient(request);
    const { error } = await supabase.from("visitor_logs").insert(logPayload);

    if (error) {
      logger.error(
        { error },
        "[TelemetryHandler] Error al registrar visitante:"
      );
    } else {
      response.cookies.set("metashark_session_id", sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 31536000,
      });
    }
  } catch (error) {
    logger.error(
      { error },
      "[TelemetryHandler] Fallo crítico en el manejador:"
    );
  }
}
