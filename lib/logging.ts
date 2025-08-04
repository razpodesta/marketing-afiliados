// lib/logging.ts
/**
 * @file lib/logging.ts
 * @description Aparato de Logging centralizado. Ha sido refactorizado para
 *              deshabilitar pino-pretty en el contexto del middleware,
 *              resolviendo un error de worker thread.
 * @author L.I.A Legacy
 * @version 6.0.0 (Middleware Logging Stability)
 */
import pino from "pino";

// --- INICIO DE CORRECCIÓN ---
// Función para crear una instancia del logger.
// El argumento `context` nos permite diferenciar si se llama desde el middleware.
function createLogger(context?: string) {
  const isMiddleware = context === "middleware";
  const defaultLogLevel =
    process.env.NODE_ENV === "development" ? "trace" : "info";

  const pinoConfig: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || defaultLogLevel,
  };

  // Solo usar pino-pretty si NO estamos en el middleware y estamos en desarrollo.
  if (process.env.NODE_ENV === "development" && !isMiddleware) {
    pinoConfig.transport = {
      target: "pino-pretty",
      options: { colorize: true, sync: true },
    };
  }

  return pino(pinoConfig);
}
// --- FIN DE CORRECCIÓN ---

let loggerInstance: pino.Logger;
let middlewareLoggerInstance: pino.Logger;

if (process.env.NODE_ENV === "test") {
  // Logger falso para pruebas sigue igual
  loggerInstance = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    trace: () => {},
    fatal: () => {},
    child: () => loggerInstance,
  } as unknown as pino.Logger;
  middlewareLoggerInstance = loggerInstance;
} else {
  loggerInstance = createLogger();
  middlewareLoggerInstance = createLogger("middleware");
}

export const logger = loggerInstance;
export const middlewareLogger = middlewareLoggerInstance;
