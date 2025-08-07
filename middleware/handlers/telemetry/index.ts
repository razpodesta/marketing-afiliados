// middleware/handlers/telemetry/index.ts
/**
 * @file middleware/handlers/telemetry/index.ts
 * @description Manejador de middleware para la inteligencia de visitante.
 *              Sincronizado con el contrato de validación `snake_case` definitivo.
 * @author L.I.A Legacy
 * @version 9.0.0 (Definitive Schema Synchronization)
 */
import { type NextRequest, type NextResponse } from "next/server";

import { logger } from "@/lib/logging";
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
  return ip.startsWith("8.8.8.8");
}

export async function handleTelemetry(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<void> {
  if (request.cookies.has("metashark_session_id")) {
    return;
  }

  try {
    const sessionId = self.crypto.randomUUID();
    const headers = request.headers;
    const ip = request.ip ?? "127.0.0.1";
    const enrichedGeoData = await lookupIpAddress(ip);

    const logPayload = VisitorLogSchema.parse({
      sessionId,
      fingerprint: "server_placeholder",
      ipAddress: ip,
      geo_data: enrichedGeoData
        ? { ...request.geo, ...enrichedGeoData }
        : request.geo,
      userAgent: headers.get("user-agent") || null,
      utmParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      referrer: headers.get("referer") || null,
      landingPage: request.nextUrl.pathname,
      browser_context: {
        secChUa: headers.get("sec-ch-ua") || null,
        secChUaMobile: headers.get("sec-ch-ua-mobile") || null,
        secChUaPlatform: headers.get("sec-ch-ua-platform") || null,
      },
      isBot: /bot|crawl|slurp|spider|mediapartners/i.test(
        headers.get("user-agent") || ""
      ),
      isKnownAbuser: await checkIpBlacklist(ip),
    });

    const { supabase } = await createClient(request);
    const { error } = await supabase.from("visitor_logs").insert(logPayload);

    if (error) {
      logger.error(
        "[TELEMETRY_HANDLER] Fallo al registrar la sesión del visitante.",
        { error: error.message }
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
      "[TELEMETRY_HANDLER] Fallo crítico en el manejador de telemetría.",
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización Definitiva de Esquema**: ((Implementada)) Se ha corregido el nombre de todos los campos para que coincidan con la nomenclatura `snake_case`, alineándolo con el validador y la base de datos.
 */
// middleware/handlers/telemetry/index.ts
