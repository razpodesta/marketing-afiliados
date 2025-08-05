// lib/actions/telemetry.actions.ts
/**
 * @file telemetry.actions.ts
 * @description Contiene Server Actions para la recolección de datos de telemetría,
 *              como el registro de visitantes para inteligencia de negocio y prevención de fraude.
 *              Este aparato está diseñado para ser llamado de forma no bloqueante,
 *              priorizando el bajo impacto en la experiencia del usuario.
 *              REFACTORIZADO: Se han corregido los errores de tipo `UUID` y se ha
 *              habilitado la inserción de la columna `browser_context` que ya existe
 *              en la base de datos.
 * @author L.I.A Legacy
 * @version 5.0.0 (UUID & Browser Context Fix)
 * @see {@link file://./tests/lib/actions/telemetry.actions.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @functionality
 * - **Validación Robusta con Zod**: Asegura que solo los datos que cumplen con el `VisitorLogSchema` o `ClientVisitSchema` sean procesados.
 * - **Enriquecimiento GeoIP**: Utiliza `geoip.service` para obtener datos detallados de la dirección IP.
 * - **Registro Estructurado**: Inserta datos de visitante en la tabla `visitor_logs` para análisis posteriores.
 * - **Manejo de Errores Silencioso**: Captura y registra errores sin lanzar excepciones, para no interrumpir flujos críticos como el middleware.
 *
 * @relationships
 * - Es invocado por manejadores de middleware (ej. `handleTelemetry`) o directamente desde el cliente.
 * - Depende de `lib/validators` para los esquemas de validación.
 * - Interactúa directamente con la tabla `visitor_logs` de la base de datos.
 * - Utiliza `lib/services/geoip.service.ts` para enriquecer la información de geolocalización.
 */
"use server";

import { headers } from "next/headers";
import { ZodError, z } from "zod";

import { logger } from "@/lib/logging";
import { lookupIpAddress } from "@/lib/services/geoip.service";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  ClientVisitSchema, // Importar ClientVisitSchema
  VisitorLogSchema, // Importar VisitorLogSchema
} from "@/lib/validators";
import type { TablesInsert } from "@/lib/types/database/_shared";

type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
};

// Esta función es un placeholder, su lógica real está en `geoip.service.ts`
// y se basa en la IP proporcionada por Vercel o directamente por el cliente.
// No es necesario modificarla aquí.
async function checkIpBlacklist(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  return ip.startsWith("8.8.8.8");
}

/**
 * @async
 * @function logVisitorAction
 * @description Registra la información de un nuevo visitante en la base de datos.
 *              Esta acción está diseñada para ser llamada una vez por sesión anónima
 *              desde el middleware. Incluye enriquecimiento de datos GeoIP y User Agent completo.
 *              Ahora con un manejo explícito del payload para asegurar la seguridad de tipos.
 *              CORREGIDO: El campo `browser_context` ya no se omite temporalmente.
 * @param {unknown} payload - Los datos del visitante a registrar. Debe ser un objeto
 *                            que cumpla con la estructura de `VisitorLogSchema`.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación, que puede ser un éxito o un fallo con un mensaje de error.
 */
export async function logVisitorAction(
  payload: unknown
): Promise<ActionResult<void>> {
  try {
    const parsedData = VisitorLogSchema.parse(payload);

    const enrichedGeoData = await lookupIpAddress(parsedData.ipAddress);

    const finalGeoData = enrichedGeoData
      ? {
          ...parsedData.geoData,
          country:
            enrichedGeoData.countryCode || parsedData.geoData?.country || null,
          city: enrichedGeoData.city || parsedData.geoData?.city || null,
          region: enrichedGeoData.region || null,
          postalCode: enrichedGeoData.zip || null,
          latitude: enrichedGeoData.lat || null,
          longitude: enrichedGeoData.lon || null,
          timeZone: enrichedGeoData.timezone || null,
          isp: enrichedGeoData.isp || null,
          org: enrichedGeoData.org || null,
          asn: enrichedGeoData.as || null,
        }
      : parsedData.geoData;

    const visitorLogToInsert: TablesInsert<"visitor_logs"> = {
      session_id: parsedData.sessionId, // Asumimos que parsedData.sessionId es un UUID válido.
      fingerprint: parsedData.fingerprint,
      ip_address: parsedData.ipAddress,
      geo_data: finalGeoData,
      user_agent: parsedData.userAgent,
      utm_params: parsedData.utmParams,
      referrer: parsedData.referrer,
      landing_page: parsedData.landingPage,
      browser_context: parsedData.browserContext, // Ya no se omite
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
        "[TelemetryAction] Intento de log con datos inválidos:",
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

/**
 * @async
 * @function logClientVisitAction
 * @description Registra datos de visita recolectados directamente desde el lado del cliente.
 *              Complementa la telemetría del middleware con información de huella digital
 *              y contexto del navegador que solo está disponible en el cliente.
 *              CORREGIDO: `session_id` ahora es siempre un UUID válido.
 *              CORREGIDO: El campo `browser_context` ya no se omite temporalmente.
 * @param {unknown} payload - Los datos del cliente, debe cumplir con `ClientVisitSchema`.
 * @returns {Promise<ActionResult<void>>} El resultado de la operación.
 */
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

    const supabase = createClient();
    const headersList = headers();
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    const userAgent = headersList.get("user-agent") || null;
    const referrer = headersList.get("referer") || null;
    const landingPage = headersList.get("x-invoke-path") || null;

    const enrichedGeoData = await lookupIpAddress(ipAddress);
    const finalGeoData = enrichedGeoData
      ? {
          country: enrichedGeoData.countryCode || null,
          city: enrichedGeoData.city || null,
          region: enrichedGeoData.region || null,
          postalCode: enrichedGeoData.zip || null,
          latitude: enrichedGeoData.lat || null,
          longitude: enrichedGeoData.lon || null,
          timeZone: enrichedGeoData.timezone || null,
          isp: enrichedGeoData.isp || null,
          org: enrichedGeoData.org || null,
          asn: enrichedGeoData.as || null,
        }
      : null;

    // CORREGIDO: Garantiza que session_id siempre sea un UUID.
    // Si el cliente no proporciona uno (ej. no hay cookie del middleware), generamos uno nuevo.
    const finalSessionId = clientProvidedSessionId || self.crypto.randomUUID();

    const clientLogToInsert: TablesInsert<"visitor_logs"> = {
      session_id: finalSessionId,
      fingerprint: fingerprint,
      ip_address: ipAddress,
      geo_data: finalGeoData,
      user_agent: userAgent,
      referrer: referrer,
      landing_page: landingPage,
      browser_context: {
        screenWidth,
        screenHeight,
        userAgentClientHint,
      },
      utm_params: null,
      is_bot: false,
      is_known_abuser: false,
    };

    const { error } = await supabase
      .from("visitor_logs")
      .insert(clientLogToInsert);

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
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Corrección de Tipo UUID en `session_id`**: ((Implementada)) La lógica de `logClientVisitAction` ahora garantiza que `session_id` siempre sea un UUID válido, ya sea proveniente del cliente (cookie) o generado.
 * 2. **Habilitación Completa de `browser_context`**: ((Implementada)) Se eliminaron las líneas que omitían `browser_context` del payload, permitiendo que este campo se almacene correctamente en la base de datos (confirmado por `diag:all`).
 * 3. **Ajuste en `ClientVisitSchema`**: ((Implementada)) El esquema se modificó para que `sessionId` sea opcional en la entrada.
 *
 * @subsection Melhorias Futuras
 * 1. **Refinar la Recolección de Datos de `userAgentData`**: ((Vigente)) Asegurarse de que la propiedad `userAgentClientHint` se recolecta correctamente y se mapea de forma más robusta a `browser_context` con un esquema Zod más granular.
 * 2. **Políticas de Retención de Logs**: ((Vigente)) Implementar políticas de retención en la base de datos para `visitor_logs` para gestionar el tamaño de la tabla a largo plazo.
 * 3. **Coordinación Transaccional `session_id`**: ((Vigente)) En un escenario de alto volumen, la generación y establecimiento de `session_id` por el middleware, y su uso por el cliente, debería ser un proceso aún más blindado y transaccional para garantizar la unicidad y consistencia en el Edge.
 */
// lib/actions/telemetry.actions.ts
