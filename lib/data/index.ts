// lib/data/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la Capa de Datos (Barrel File).
 *              Ha sido refactorizado para incluir la exportación de los
 *              módulos `notifications` e `invitations`, restaurando la integridad
 *              de la capa de datos y resolviendo errores de importación.
 * @author L.I.A Legacy
 * @version 1.3.0 (Invitations Module Export)
 */

export * as admin from "./admin";
export * as campaigns from "./campaigns";
export * as invitations from "./invitations"; // <-- EXPORTACIÓN AÑADIDA
export * as modules from "./modules";
export * as notifications from "./notifications";
export * as permissions from "./permissions";
export * as sites from "./sites";
export * as workspaces from "./workspaces";

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronização de Manifesto**: ((Implementada)) Se ha añadido la exportación del nuevo módulo atómico `invitations`, manteniendo el manifiesto de la capa de datos consistente con la estructura de archivos.
 *
 * @subsection Melhorias Futuras
 * 1.  **Geração Automática**: ((Vigente)) Crear un script para generar este archivo y prevenir omisiones manuales.
 */
// lib/data/index.ts
