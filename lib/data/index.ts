// lib/data/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la Capa de Datos (Barrel File).
 *              Ha sido refactorizado para incluir la exportación del
 *              módulo `notifications`, restaurando la integridad de
 *              la capa de datos y resolviendo errores de importación.
 * @author L.I.A Legacy
 * @version 1.2.0 (Notification Module Export)
 */

export * as admin from "./admin";
export * as campaigns from "./campaigns";
export * as modules from "./modules";
// --- INICIO DE REFACTORIZACIÓN ---
export * as notifications from "./notifications"; // Exportación añadida
// --- FIN DE REFACTORIZACIÓN ---
export * as permissions from "./permissions";
export * as sites from "./sites";
export * as workspaces from "./workspaces";

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Generación Automática**: ((Vigente)) Crear un script para generar este archivo y prevenir omisiones manuales.
 */
// lib/data/index.ts
