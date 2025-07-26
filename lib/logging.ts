// lib/logging.ts
/**
 * @file Utilidad de Logging para el Servidor
 * @description Proporciona una utilidad de logging simple y centralizada para el lado del
 * servidor. Utiliza prefijos y colores para diferenciar los mensajes y hacer que la
 * salida de la consola sea más legible durante el desarrollo y la depuración.
 *
 * @author Metashark
 * @version 1.0.0
 */

const a = "\x1b[38;5;214m"; // Naranja para advertencias
const c = "\x1b[36m"; // Cian para información
const e = "\x1b[31m"; // Rojo para errores
const g = "\x1b[32m"; // Verde para éxito
const r = "\x1b[0m"; // Resetear color

export const logger = {
  /**
   * @description Registra un mensaje de información general.
   * @param {string} message - El mensaje a registrar.
   */
  info: (message: string) => {
    console.log(`${c}[INFO]${r} ${message}`);
  },

  /**
   * @description Registra un mensaje de advertencia.
   * @param {string} message - La advertencia a registrar.
   */
  warn: (message: string) => {
    console.log(`${a}[WARN]${r} ${message}`);
  },

  /**
   * @description Registra un mensaje de error.
   * @param {string} message - El error a registrar.
   * @param {unknown} [errorObj] - El objeto de error opcional para más contexto.
   */
  error: (message: string, errorObj?: unknown) => {
    console.error(`${e}[ERROR]${r} ${message}`);
    if (errorObj) {
      console.error(errorObj);
    }
  },

  /**
   * @description Registra un mensaje de operación exitosa.
   * @param {string} message - El mensaje de éxito a registrar.
   */
  success: (message: string) => {
    console.log(`${g}[SUCCESS]${r} ${message}`);
  },
};

/* MEJORAS PROPUESTAS
 * 1. **Integración con Servicio Externo:** Esta utilidad es el lugar perfecto para integrar un servicio de logging profesional como Sentry, Pino o Logtail. En las funciones `error` y `warn`, además de hacer `console.log`, se podría enviar el evento al servicio externo.
 * 2. **Niveles de Log:** Implementar niveles de log configurables a través de variables de entorno (ej. `LOG_LEVEL=debug`), para mostrar más o menos información según el entorno (desarrollo vs. producción).
 */
