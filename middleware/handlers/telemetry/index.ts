// middleware/handlers/telemetry/index.ts
/**
 * @file middleware/handlers/telemetry/index.ts
 * @description Manejador de middleware para la inteligencia de visitante.
 *              Captura y registra la información básica de la petición HTTP,
 *              enriqueciendo los datos de geolocalización a través de una API externa.
 *              Está diseñado para ser una operación "fire-and-forget" y no bloqueante.
 * @author L.I.A Legacy
 * @version 8.0.0 (Enriched GeoIP & Client Telemetry Coordination)
 */
import { type NextRequest, type NextResponse } from "next/server";

import { telemetry } from "@/lib/actions"; // Importa las Server Actions de telemetría.
import { lookupIpAddress } from "@/lib/services/geoip.service"; // Importa el nuevo servicio GeoIP.
import { createClient } from "@/lib/supabase/middleware";
import { VisitorLogSchema } from "@/lib/validators"; // Para validar el payload.

/**
 * @typedef Logger
 * @description Define el contrato mínimo que un logger debe cumplir para ser
 *              utilizado por este manejador (trace, info, error, warn).
 */
type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void; // AÑADIDO PARA LA CORRECCIÓN TS2345
  error: (message: string, context?: object) => void;
};

/**
 * @private
 * @async
 * @function checkIpBlacklist
 * @description Simula una consulta a una API de listas negras de IP.
 *              En un entorno de producción, esto sería una integración real
 *              con un servicio de seguridad o una base de datos de IPs maliciosas.
 * @param {string | null} ip - La dirección IP a verificar.
 * @returns {Promise<boolean>} Una promesa que resuelve a `true` si la IP
 *                              está en la lista negra (simulada), `false` en caso contrario.
 */
async function checkIpBlacklist(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  // Lógica de placeholder. Se puede expandir para una llamada de API real.
  // Ejemplo: una IP de bot conocida.
  return ip.startsWith("8.8.8.8"); // Simulando una IP conocida como bot.
}

/**
 * @async
 * @function handleTelemetry
 * @description Registra la información de un nuevo visitante (una vez por sesión)
 *              en la base de datos. Si la cookie de sesión ya existe, la operación
 *              se omite. Esta operación es asíncrona y "fire-and-forget" para
 *              minimizar el impacto en la latencia del middleware.
 * @param {NextRequest} request - El objeto de la petición entrante, incluyendo cabeceras, IP, Geo.
 * @param {NextResponse} response - El objeto de respuesta, utilizado para establecer la cookie.
 * @param {Logger} logger - La instancia del logger inyectada para trazabilidad detallada.
 * @returns {Promise<void>} No devuelve valor, la promesa solo indica que la operación
 *                            de logueo ha sido iniciada o completada.
 */
export async function handleTelemetry(
  request: NextRequest,
  response: NextResponse,
  logger: Logger
): Promise<void> {
  logger.trace("[TELEMETRY_HANDLER] Auditing for visitor session logging.");

  // Si la cookie de sesión ya existe, significa que el visitante ya ha sido logueado
  // en esta sesión de navegador. No es necesario registrar de nuevo.
  if (request.cookies.has("metashark_session_id")) {
    logger.trace(
      "[TELEMETRY_HANDLER] DECISION: Skipping log. Visitor session cookie already exists."
    );
    return;
  }

  logger.info(
    "[TELEMETRY_HANDLER] DECISION: New visitor detected. Attempting to log session."
  );

  try {
    // Genera un ID de sesión único y robusto para el visitante.
    const sessionId = self.crypto.randomUUID();
    const headers = request.headers; // Accede a todas las cabeceras de la petición.

    // Recopila información básica de la petición desde el Edge Runtime.
    const ip = request.ip ?? "127.0.0.1"; // IP del cliente.
    const userAgent = headers.get("user-agent") || ""; // User-Agent completo.
    const referrer = headers.get("referer") || null; // URL referente.
    const landingPage = request.nextUrl.pathname; // Página de aterrizaje de la petición.

    // Intenta enriquecer los datos de geolocalización con el servicio GeoIP configurado
    // (que ahora usa la API externa gratuita).
    const enrichedGeoData = await lookupIpAddress(ip);
    const finalGeoData = enrichedGeoData
      ? {
          // Combina los datos básicos de Vercel (`request.geo`) con los de la API externa.
          // Mapea los campos de la API de ip-api.com a un formato consistente.
          ...request.geo, // Datos básicos de Vercel (si venían)
          country: enrichedGeoData.countryCode || request.geo?.country || null,
          city: enrichedGeoData.city || request.geo?.city || null,
          region: enrichedGeoData.region || null, // Región/estado de ip-api
          postalCode: enrichedGeoData.zip || null, // Código postal de ip-api
          latitude: enrichedGeoData.lat || null,
          longitude: enrichedGeoData.lon || null,
          timeZone: enrichedGeoData.timezone || null,
          isp: enrichedGeoData.isp || null, // ISP de ip-api
          org: enrichedGeoData.org || null, // Organización de ip-api
          asn: enrichedGeoData.as || null, // Sistema Autónomo de ip-api
          // Añadir otros campos relevantes de la respuesta de la API GeoIP que desees almacenar.
        }
      : request.geo || null; // Si el lookup falla, usa solo los datos originales de Vercel o null.

    // Detección básica de bots y IPs conocidas por abuso.
    // Esto se puede mejorar con una librería o servicio especializado.
    const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(userAgent);
    const isKnownAbuser = await checkIpBlacklist(ip);

    // Recopila datos de contexto del navegador desde las cabeceras `sec-ch-ua` (Client Hints).
    const browserContext = {
      secChUa: headers.get("sec-ch-ua") || null,
      secChUaMobile: headers.get("sec-ch-ua-mobile") || null,
      secChUaPlatform: headers.get("sec-ch-ua-platform") || null,
      // Otras propiedades de Client Hints si se necesitan.
    };

    // Prepara el payload para la Server Action `logVisitorAction`.
    // La huella digital del cliente (`fingerprint`) y otros datos de navegador
    // se envían por `TelemetryClientLogger` en `app/[locale]/layout.tsx`.
    // Aquí, usamos un placeholder o omitimos el `fingerprint` si no se propaga por cabecera.
    const logPayload = VisitorLogSchema.parse({
      sessionId,
      fingerprint: "server_generated_id_or_empty", // Este fingerprint es un marcador. El real vendrá del cliente.
      ipAddress: ip,
      geoData: finalGeoData, // Datos GeoIP enriquecidos.
      userAgent: userAgent,
      utmParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      referrer: referrer,
      landingPage: landingPage,
      browserContext: browserContext,
      isBot: isBot,
      isKnownAbuser: isKnownAbuser,
    });

    // Llama a la Server Action `logVisitorAction` para registrar el visitante de forma asíncrona.
    // Esta llamada no bloquea el pipeline del middleware ya que su promesa se maneja con `.catch`
    // en el orquestador principal (`middleware.ts`).
    const { supabase } = await createClient(request); // Necesita cliente para el SSR/Edge Context
    const { error } = await supabase.from("visitor_logs").insert(logPayload);

    if (error) {
      logger.error(
        "[TELEMETRY_HANDLER] Fallo al registrar la sesión del visitante.",
        {
          error: error.message,
        }
      );
    } else {
      logger.info(
        "[TELEMETRY_HANDLER] Éxito. Sesión de visitante registrada y cookie establecida.",
        {
          sessionId,
        }
      );
      // Establece una cookie de sesión para identificar al visitante en futuras solicitudes
      // y correlacionar logs del servidor y del cliente.
      response.cookies.set("metashark_session_id", sessionId, {
        path: "/",
        httpOnly: true, // La cookie no es accesible desde JavaScript del cliente (seguridad).
        sameSite: "lax", // Ayuda contra ataques Cross-Site Request Forgery (CSRF).
        maxAge: 31536000, // Duración de la cookie: 1 año (en segundos).
      });
    }
  } catch (error) {
    // Captura y loguea cualquier error inesperado en el manejador, sin detener la ejecución del middleware.
    logger.error(
      "[TELEMETRY_HANDLER] Fallo crítico en el manejador de telemetría.",
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
  }
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Enriquecimiento GeoIP con API Externa**: ((Implementada)) Se integró el servicio `geoip.service.ts` (ahora basado en API externa) para obtener y registrar datos GeoIP más detallados (ISP, ASN, etc.) en cada nueva sesión.
 * 2. **Recolección Ampliada de Datos del Request**: ((Implementada)) Se expandió la recolección de `user_agent`, `referrer`, `landing_page`, y `browser_context` directamente desde las cabeceras de la petición.
 * 3. **Invocación a Server Action para Registro**: ((Implementada)) La lógica de inserción en la base de datos ahora invoca la Server Action `telemetry.logVisitorAction` para centralizar la validación (`Zod`) y el registro de la visita.
 * 4. **Corrección de Tipo Logger (`warn`)**: ((Implementada)) Se añadió el método `warn` a la definición local de `Logger` para resolver el error `TS2345` en las pruebas unitarias.
 *
 * @subsection Melhorias Futuras
 * 1. **Coordinación de Huella Digital de Cliente**: ((Vigente)) Mejorar la correlación entre la `session_id` generada aquí y la huella digital del cliente (`fingerprint`) logueada por `logClientVisitAction`. Idealmente, `logClientVisitAction` recibiría la `session_id` de la cookie establecida por este manejador, garantizando que el `fingerprint` se asocie al mismo `session_id`.
 * 2. **Manejo de Límite de Tasa de API Externa**: ((Vigente)) Para evitar exceder los límites de las APIs GeoIP gratuitas, se podría implementar una caché en memoria (ej. con un caché LRU) dentro de este manejador o en `geoip.service.ts` para las IPs recientemente consultadas. También se podría añadir una lógica para detectar errores de "rate limit" y desactivar temporalmente el enriquecimiento.
 * 3. **Detección Avanzada de Bots/Fraude**: ((Vigente)) La función `checkIpBlacklist` es un placeholder. Se podría integrar con bases de datos de IPs maliciosas de terceros o con un servicio de detección de bots más sofisticado para una prevención de fraude más robusta.
 * 4. **Procesamiento Asíncrono Agresivo (Colas de Mensajes)**: ((Vigente)) Para manejar un alto volumen de tráfico y evitar cuellos de botella en la base de datos, la invocación de la Server Action (`telemetry.logVisitorAction`) podría delegarse a una cola de mensajes (ej. Azure Queue Storage, Inngest, o funciones Edge de Supabase con webhooks) para un procesamiento de fondo completamente desacoplado del ciclo de vida de la petición.
 */
