// Ruta: lib/logging.ts
/**
 * @file lib/logging.ts
 * @description Aparato de Logging centralizado y de nivel de producción.
 *              Utiliza Pino para un logging estructurado y de alto rendimiento.
 *              Refactorizado para ser estable en el entorno de Next.js Server Components.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 3.0.0 (Next.js RSC Stability Patch)
 */
import pino from "pino";

// --- ANÁLISIS DE INGENIERÍA ---
// El error 'worker thread exited' se debe a que `pino-pretty`, por defecto,
// utiliza `thread-stream` para un logging asíncrono. Sin embargo, el bundler de
// Next.js para Server Components no empaqueta correctamente este worker,
// causando un `MODULE_NOT_FOUND` y un crash fatal del servidor al intentar loggear.
//
// --- SOLUCIÓN ARQUITECTÓNICA ---
// La solución es reconfigurar el transporte de `pino-pretty` para que se ejecute
// de forma síncrona en el mismo proceso durante el desarrollo. Esto elimina la
// dependencia del worker thread, estabiliza el servidor de desarrollo y sigue
// proporcionando logs legibles, sin un impacto de rendimiento notable en este entorno.
// En producción, el transporte no se usa, y Pino escribirá logs JSON estructurados
// a `stdout`, lo cual es la práctica recomendada para servicios de logging externos.

const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        // CORRECCIÓN CRÍTICA: Desactiva el logging asíncrono que causa el crash.
        sync: true,
      },
    },
  }),
};

/**
 * @const logger
 * @description Instancia única y global del logger de Pino para toda la aplicación.
 *              Debe ser importado desde este módulo para garantizar una configuración consistente.
 */
export const logger = pino(pinoConfig);
/* MEJORAS PROPUESTAS
 * 1. **Integración con Servicio Externo:** Esta utilidad es el lugar perfecto para integrar un servicio de logging profesional como Sentry, Pino o Logtail. En las funciones `error` y `warn`, además de hacer `console.log`, se podría enviar el evento al servicio externo.
 * 2. **Niveles de Log:** Implementar niveles de log configurables a través de variables de entorno (ej. `LOG_LEVEL=debug`), para mostrar más o menos información según el entorno (desarrollo vs. producción).
 */
