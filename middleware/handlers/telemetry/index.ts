// middleware/handlers/telemetry/index.ts
/**
 * @file middleware/handlers/telemetry/index.ts
 * @description Manejador de middleware para la inteligencia de visitante.
 *              Implementa un sistema de sesión anónima para registrar datos
 *              de nuevos visitantes de forma no bloqueante.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { randomUUID } from "crypto";
import { type NextRequest, type NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/middleware";

/**
 * @async
 * @function handleTelemetry
 * @description Gestiona el registro de nuevos visitantes. Si no existe una
 *              cookie de sesión, crea una, registra los datos del visitante
 *              y la establece en la respuesta.
 * @param {NextRequest} request - El objeto de la petición entrante.
 * @param {NextResponse} response - El objeto de respuesta actual del pipeline.
 */
export async function handleTelemetry(
  request: NextRequest,
  response: NextResponse
): Promise<void> {
  if (request.cookies.has("metashark_session_id")) {
    return;
  }

  try {
    const sessionId = randomUUID();
    // No se necesita la respuesta de createClient aquí, solo el cliente.
    const { supabase } = await createClient(request);

    const { error } = await supabase.from("visitor_logs").insert({
      session_id: sessionId,
      fingerprint: "server_side_fingerprint_placeholder",
      ip_address: request.ip ?? "127.0.0.1",
      geo_data: request.geo
        ? {
            country: request.geo.country,
            city: request.geo.city,
            region: request.geo.region,
          }
        : null,
      user_agent: request.headers.get("user-agent"),
      utm_params: Object.fromEntries(request.nextUrl.searchParams.entries()),
    });

    if (error) {
      logger.error("[TelemetryHandler] Error al registrar visitante:", error);
    } else {
      response.cookies.set("metashark_session_id", sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 31536000, // 1 año
      });
    }
  } catch (error) {
    logger.error("[TelemetryHandler] Fallo crítico en el manejador:", error);
  }
}

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la inteligencia de visitante.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Procesamiento Asíncrono**: (Vigente) Para no impactar la latencia, el registro de visitantes podría delegarse a una Edge Function o un servicio de cola (como Inngest) que procesaría los datos de forma asíncrona.
 * 2. **Integración de Fingerprint del Cliente**: (Vigente) Implementar una lógica en el `RootLayout` que envíe la huella digital generada por FingerprintJS a una Server Action para actualizar el registro del visitante.
 */
// middleware/handlers/telemetry/index.ts
