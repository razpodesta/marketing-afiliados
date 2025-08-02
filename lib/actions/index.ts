// lib/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Este archivo exporta todas las Server Actions del proyecto, agrupadas
 *              por namespaces de dominio para una máxima organización y claridad.
 *
 * @version 3.1.0 (Telemetry Namespace Integration)
 * @author Metashark
 *
 * @important Este archivo es generado automáticamente. No lo edite manualmente.
 */

export * as admin from "./admin.actions";
export * as auth from "./auth.actions";
export * as builder from "./builder.actions";
export * as campaigns from "./campaigns.actions";
export * as password from "./password.actions";
export * as profiles from "./profiles.actions";
export * as session from "./session.actions";
export * as sites from "./sites.actions";
export * as telemetry from "./telemetry.actions"; // <-- NUEVO NAMESPACE
export * as workspaces from "./workspaces.actions";

/**
 * @section MEJORA CONTINUA
 * @description Este archivo es gestionado por un script (`scripts/generate-actions-barrel.mjs`).
 *              Las mejoras deben dirigirse a ese script para automatizar su
 *              mantenimiento y robustez.
 */
// lib/actions/index.ts
