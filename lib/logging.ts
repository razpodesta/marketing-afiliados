// lib/logging.ts
/**
 * @file lib/logging.ts
 * @description Aparato de Logging Canónico y de Alta Visibilidad.
 *              Esta es la Única Fuente de Verdad para el logging en el entorno de servidor (Node.js).
 *              Ha sido restaurado a una arquitectura simplificada para garantizar un formato
 *              legible ("pretty print") y un rendimiento óptimo en el arranque.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 10.0.0 (High-Visibility & Performance Restoration)
 */
import * as Sentry from "@sentry/nextjs";

type LogLevel = "trace" | "info" | "warn" | "error";

/**
 * @description Formatea y colorea los mensajes de log para la consola de desarrollo.
 * @param {LogLevel} level - El nivel del log.
 * @param {string} message - El mensaje principal.
 * @param {any[]} context - Datos adicionales.
 */
function logToConsole(level: LogLevel, message: string, ...context: any[]) {
  if (process.env.NODE_ENV !== "development") return;

  const colors = {
    trace: "\x1b[90m", // Gray
    info: "\x1b[32m", // Green
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };
  const color = colors[level] || "\x1b[37m"; // Default to white
  const reset = "\x1b[0m";
  const timestamp = new Date().toLocaleTimeString();

  console.log(
    `${color}[${level.toUpperCase()}]${reset} [${timestamp}] ${message}`,
    ...context
  );
}

/**
 * @description Objeto logger principal para el entorno de servidor Node.js.
 */
export const logger = {
  trace: (message: string, ...context: any[]) => {
    logToConsole("trace", message, ...context);
  },
  info: (message: string, ...context: any[]) => {
    logToConsole("info", message, ...context);
    Sentry.captureMessage(message, { level: "info", extra: { context } });
  },
  warn: (message: string, ...context: any[]) => {
    logToConsole("warn", message, ...context);
    Sentry.captureMessage(message, { level: "warning", extra: { context } });
  },
  error: (message: string, ...context: any[]) => {
    logToConsole("error", message, ...context);
    Sentry.captureMessage(message, { level: "error", extra: { context } });
  },
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Legibilidad Restaurada**: ((Implementada)) Se ha restaurado el formato de log simple y coloreado para el desarrollo local, eliminando la salida minificada.
 * 2. **Rendimiento Mejorado**: ((Implementada)) Al eliminar las dependencias de `chalk` y `util`, se reduce la sobrecarga en el arranque del servidor.
 *
 * @subsection Melhorias Futuras
 * 1. **Integración con `pino-pretty`**: ((Vigente)) Para un "pretty printing" aún más avanzado y configurable en desarrollo, se podría integrar la librería `pino` con su transport `pino-pretty`.
 */
// lib/logging.ts
