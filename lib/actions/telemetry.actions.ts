// lib/actions/telemetry.actions.ts
/**
 * @file telemetry.actions.ts
 * @description Contiene Server Actions para la recolección de datos de telemetría.
 *              REFACTORIZADO: Corregida la capitalización en la ruta de importación
 *              y restaurada la integridad completa del aparato.
 * @author L.I.A Legacy
 * @version 8.2.1 (Build Fix & Integrity Restoration)
 */
"use server";

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
      session_id: parsedData.sessionId,
      fingerprint: parsedData.fingerprint,
      ip_address: parsedData.ipAddress,
      geo_data: finalGeoData,
      user_agent: parsedData.userAgent,
      utm_params: parsedData.utmParams,
      referrer: parsedData.referrer,
      landing_page: parsedData.landingPage,
      browser_context: parsedData.browserContext,
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
    let finalSessionId = clientProvidedSessionId;
    if (!finalSessionId) {
      finalSessionId = randomUUID();
    }
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
    const browserContext = { screenWidth, screenHeight, userAgentClientHint };
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
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Build (Casing)**: ((Implementada)) Se ha corregido la capitalización de la ruta de importación.
 * 2. **Integridad Restaurada**: ((Implementada)) Se ha restaurado toda la funcionalidad original del aparato, eliminando la regresión.
 */
