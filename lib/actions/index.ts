// Ruta: lib/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Este archivo exporta todas las Server Actions del proyecto, agrupadas
 *              por namespaces de dominio para una máxima organización y claridad.
 *
 * @version 3.0.0 (Architectural Alignment & Auto-Generation)
 * @author Metashark
 *
 * @important Este archivo es generado automáticamente por el script:
 *            `scripts/generate-actions-barrel.mjs`.
 *            No lo edite manualmente.
 *
 * @example
 * // Antes: import { createSiteAction } from "@/lib/actions/sites.actions";
 * // Ahora: import { sites } from "@/lib/actions";
 * // Uso:   sites.createSiteAction(...)
 */

export * as admin from "./admin.actions";
export * as auth from "./auth.actions";
export * as builder from "./builder.actions";
export * as campaigns from "./campaigns.actions";
export * as password from "./password.actions";
export * as profiles from "./profiles.actions";
export * as session from "./session.actions";
export * as sites from "./sites.actions";
export * as workspaces from "./workspaces.actions";
