// lib/logging.ts
/**
 * @file logging.ts
 * @description Aparato de Logging centralizado y de nivel de producción.
 *              Utiliza Pino para un logging estructurado y de alto rendimiento.
 *              Soporta un nivel 'verbose' para depuración detallada.
 * @author L.I.A Legacy
 * @version 2.1.0 (Verbose Mode)
 */
import pino from "pino";

// El nivel de log 'trace' es el más detallado. Lo usaremos para el modo verbose.
const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
};

export const logger = pino(pinoConfig);
/* MEJORAS PROPUESTAS
 * 1. **Integración con Servicio Externo:** Esta utilidad es el lugar perfecto para integrar un servicio de logging profesional como Sentry, Pino o Logtail. En las funciones `error` y `warn`, además de hacer `console.log`, se podría enviar el evento al servicio externo.
 * 2. **Niveles de Log:** Implementar niveles de log configurables a través de variables de entorno (ej. `LOG_LEVEL=debug`), para mostrar más o menos información según el entorno (desarrollo vs. producción).
 */
