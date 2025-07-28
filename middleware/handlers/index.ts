// Ruta: middleware/handlers/index.ts
/**
 * @file index.ts
 * @description Barrel file para exportar todos los manejadores del middleware
 * desde una única ubicación para una importación limpia.
 *
 * @author Metashark
 * @version 1.0.0
 */

export * from "./auth.handler";
export * from "./maintenance.handler";
export * from "./multitenancy.handler";
export * from "./redirects.handler";
