// lib/dev/verbose-logger.ts (NUEVO APARATO)
/**
 * @file verbose-logger.ts
 * @description Aparato de Diagnóstico Verboso para el entorno de pruebas.
 *              Proporciona una traza de ejecución detallada y formateada para
 *              ayudar a depurar flujos complejos en las pruebas.
 *              Solo se activa con la variable de entorno `VERBOSE_LOGGING=true`.
 *
 * @author L.I.A. Legacy
 * @version 1.0.0
 *
 * @example
 * // En un archivo de prueba o de producción:
 * import { verboseLogger } from '@/lib/dev/verbose-logger';
 *
 * export async function someComplexFunction(arg1: string, arg2: object) {
 *   verboseLogger('someComplexFunction ENTRY', { arg1, arg2 });
 *   // ... lógica de la función
 * }
 *
 * // En la terminal:
 * // VERBOSE_LOGGING=true pnpm test:focus
 */
import chalk from "chalk";

/**
 * @interface LoggerOptions
 * @description Opciones para la función de logging.
 * @property {string} [level='info'] - El nivel de log (usado para colorear).
 * @property {boolean} [collapsed=false] - Si el grupo de log debe empezar colapsado.
 */
interface LoggerOptions {
  level?: "info" | "warn" | "error" | "trace";
  collapsed?: boolean;
}

/**
 * @function verboseLogger
 * @description Imprime una traza de ejecución detallada en la consola si
 *              `process.env.VERBOSE_LOGGING` es 'true'.
 * @param {string} title - El título o nombre de la función que se está registrando.
 * @param {Record<string, unknown>} [data] - Un objeto con los datos (argumentos, estado) a registrar.
 * @param {LoggerOptions} [options] - Opciones de configuración para el log.
 */
export function verboseLogger(
  title: string,
  data?: Record<string, unknown>,
  options: LoggerOptions = {}
) {
  if (process.env.VERBOSE_LOGGING !== "true") {
    return;
  }

  const { level = "info", collapsed = false } = options;

  const colorMap = {
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
    trace: chalk.magenta,
  };

  const titleColor = colorMap[level] || chalk.white;
  const groupMethod = collapsed ? console.groupCollapsed : console.group;

  groupMethod(titleColor.bold(`🔎 ${title}`));

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      console.log(chalk.blue(`${key}:`), JSON.stringify(value, null, 2));
    });
  }

  console.groupEnd();
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Medición de Tiempo de Ejecución**: ((Vigente)) Añadir una función `verboseLogger.time(label)` y `verboseLogger.timeEnd(label)` que utilice `performance.now()` para medir y registrar la duración de bloques de código específicos.
 * 2. **Integración con `vitest.setup.ts`**: ((Vigente)) Se podría hacer `stubGlobal` de este logger para que, incluso si se deja accidentalmente en el código, no se ejecute en el pipeline de CI, a menos que se habilite explícitamente.
 */
// lib/dev/verbose-logger.ts