// lib/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Ha sido actualizado para incluir el nuevo namespace `invitations`,
 *              completando la refactorización atómica.
 * @version 5.0.0 (Atomic Namespace Refactor)
 */

export * as admin from "./admin.actions";
export * as auth from "./auth.actions";
export * as builder from "./builder.actions";
export * as campaigns from "./campaigns.actions";
export * as invitations from "./invitations.actions"; // <-- NUEVO NAMESPACE
export * as password from "./password.actions";
export * as profiles from "./profiles.actions";
export * as session from "./session.actions";
export * as sites from "./sites.actions";
export * as telemetry from "./telemetry.actions";
export * as workspaces from "./workspaces.actions";
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronização de Manifesto**: ((Implementada)) Se ha añadido la exportación del nuevo módulo atómico `invitations`, manteniendo el manifiesto de la capa de acciones consistente con la estructura de archivos y resolviendo la causa raíz de los errores de importación.
 *
 * @subsection Melhorias Futuras
 * 1.  **Geração Automática**: ((Vigente)) O script `generate-actions-barrel.mjs` agora garante que este arquivo esteja sempre sincronizado.
 */
// lib/actions/index.ts
