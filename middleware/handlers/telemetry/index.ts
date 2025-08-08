// middleware/handlers/telemetry/index.ts
/**
 * @file middleware/handlers/telemetry/index.ts
 * @description Manejador de middleware para la inteligencia de visitante.
 *              Ha sido sincronizado con el contrato de validación `snake_case`
 *              definitivo y enriquecido con observabilidad de alto nivel.
 * @author L.I.A Legacy
 * @version 11.0.0 (Definitive Schema Synchronization & Full Observability)
 */
import { type NextRequest, type NextResponse } from "next/server";
import { ZodError } from "zod";

import { lookupIpAddress } from "@/lib/services/geoip.service";
import { createClient } from "@/lib/supabase/middleware";
import { VisitorLogSchema } from "@/lib/validators";

type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};

async function checkIpBlacklist(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  return ip.startsWith("8.8.8.8"); // Placeholder for a real blacklist check
}

export async function handleTelemetry(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<void> {
  if (request.cookies.has("metashark_session_id")) {
    logger.trace("[TelemetryHandler] Skipping log, session cookie exists.");
    return;
  }
  logger.info("[TelemetryHandler] New visitor detected, initiating log.");

  try {
    const sessionId = self.crypto.randomUUID();
    const headers = request.headers;
    const ip = request.ip ?? "127.0.0.1";
    const enrichedGeoData = await lookupIpAddress(ip);

    const logPayload = {
      session_id: sessionId,
      fingerprint: "server_placeholder", // Será actualizado por el cliente
      ip_address: ip,
      geo_data: enrichedGeoData
        ? { ...request.geo, ...enrichedGeoData }
        : request.geo,
      user_agent: headers.get("user-agent") || null,
      utm_params: Object.fromEntries(request.nextUrl.searchParams.entries()),
      referrer: headers.get("referer") || null,
      landing_page: request.nextUrl.pathname,
      browser_context: {
        secChUa: headers.get("sec-ch-ua") || null,
        secChUaMobile: headers.get("sec-ch-ua-mobile") || null,
        secChUaPlatform: headers.get("sec-ch-ua-platform") || null,
      },
      is_bot: /bot|crawl|slurp|spider|mediapartners/i.test(
        headers.get("user-agent") || ""
      ),
      is_known_abuser: await checkIpBlacklist(ip),
    };

    // Validar el payload antes de la inserción
    const validatedPayload = VisitorLogSchema.parse(logPayload);

    const { supabase } = await createClient(request);
    const { error } = await supabase
      .from("visitor_logs")
      .insert(validatedPayload);

    if (error) {
      logger.error("[TelemetryHandler] Failed to register visitor session.", {
        error: error.message,
        details: error.details,
      });
    } else {
      logger.info(
        "[TelemetryHandler] Visitor session registered successfully.",
        { sessionId }
      );
      response.cookies.set("metashark_session_id", sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 31536000, // 1 año
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("[TelemetryHandler] Invalid visitor log payload.", {
        errors: error.flatten(),
      });
    } else {
      logger.error(
        "[TelemetryHandler] Critical failure in telemetry handler.",
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronización Definitiva de Esquema**: ((Implementada)) Se ha corregido la nomenclatura de todos los campos en el `logPayload` para que sea `snake_case`, alineándolo con `VisitorLogSchema` y resolviendo el error de compilación `TS2769`.
 * 2.  **Validación Explícita**: ((Implementada)) Se ha añadido una llamada explícita a `VisitorLogSchema.parse()` para validar el payload antes de intentar insertarlo, mejorando la robustez y el manejo de errores.
 * 3.  **Full Observabilidad**: ((Implementada)) Se ha enriquecido el logging para incluir detalles de errores de Zod y de la base de datos, proporcionando una visibilidad completa del flujo.
 */
// middleware/handlers/telemetry/index.ts
