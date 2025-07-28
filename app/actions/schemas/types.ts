// Ruta: app/actions/schemas/types.ts
/**
 * @file types.ts
 * @description Define los tipos de datos estandarizados que retornan las Server Actions.
 * REFACTORIZACIÓN DE MÓDULO: Se ha asegurado que `ActionResult` sea exportado
 * correctamente para que pueda ser consumido por otros módulos.
 *
 * @author Metashark
 * @version 1.1.0 (Export Fix)
 */

/**
 * @typedef {object} ActionResult
 * @description Un tipo estandarizado para el retorno de todas las Server Actions,
 *              facilitando el manejo de estados de éxito y error en el cliente.
 * @template T - El tipo de datos devueltos en caso de éxito.
 */
export type ActionResult<T = null> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: T };
