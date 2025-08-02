// lib/logging.ts
/**
 * @file lib/logging.ts
 * @description Aparato de Logging centralizado y de nivel de producción.
 *              Utiliza Pino para un logging estructurado y de alto rendimiento.
 *              Refactorizado para ser estable en el entorno de Next.js Server Components
 *              al forzar el modo síncrono en el transporte de desarrollo.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.0.0 (Next.js RSC Stability Patch)
 */
import pino from "pino";

const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        // CORRECCIÓN CRÍTICA: Desactiva el logging asíncrono que causa el crash.
        // Esto fuerza a pino-pretty a ejecutarse en el hilo principal.
        sync: true,
      },
    },
  }),
};

/**
 * @const logger
 * @description Instancia única y global del logger de Pino para toda la aplicación.
 */
export const logger = pino(pinoConfig);
// lib/logging.ts
