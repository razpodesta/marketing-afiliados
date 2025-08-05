// lib/actions/_helpers/index.ts
/**
 * @file lib/actions/_helpers/index.ts
 * @description Archivo barril para exportar helpers compartidos entre Server Actions.
 *              Facilita la importación y organización de funciones auxiliares.
 *              **REFACTORIZADO:** Se ha corregido la reexportación de `rate-limiter.helper`
 *              para alinearse con la nueva firma de su archivo fuente (`checkRateLimit`).
 * @author L.I.A Legacy
 * @version 2.0.0 (Rate Limiter Export Fix)
 */

export { createAuditLog } from "./audit-log.helper";
export { EmailService } from "./email-service.helper";
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
// Se importa la función directamente.
import { checkRateLimit } from "./rate-limiter.helper";
/**
 * @const rateLimiter
 * @description Objeto que encapsula funciones para la limitación de tasa.
 *              Se reexporta la función `checkRateLimit` bajo el nombre `check`.
 */
export const rateLimiter = { check: checkRateLimit };
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejorias Futuras
 * 1. **Generación Automática**: ((Vigente)) Crear un script para generar este archivo y prevenir omisiones manuales.
 *
 * @subsection Mejorias Implementadas
 * 1. **Corrección de Exportación de `rateLimiter`**: ((Implementada)) Se ha modificado la reexportación para que `checkRateLimit` sea accesible a través de `rateLimiter.check`, resolviendo el error de compilación `export 'rateLimiter' ... not found` y `A "use server" file can only export async functions, found object`.
 */
// lib/actions/_helpers/index.ts
