// lib/types/database/tables/index.ts
/**
 * @file index.ts
 * @description Archivo barril para la exportación modular de todos los tipos de tabla.
 *              Actualizado para incluir la tabla `notifications`, resolviendo un
 *              error de compilación crítico.
 * @author L.I.A Legacy
 * @version 2.1.0 (Schema Synchronization)
 */
export * from "./achievements";
export * from "./affiliate_products";
export * from "./asset_library";
export * from "./audit_logs";
export * from "./brand_kits";
export * from "./campaigns";
export * from "./coupons";
export * from "./custom_blocks";
export * from "./customers";
export * from "./feature_flags";
export * from "./invitations";
export * from "./notifications"; // <-- LÍNEA AÑADIDA
export * from "./prices";
export * from "./product_categories";
export * from "./products";
export * from "./profiles";
export * from "./sites";
export * from "./subscribers";
export * from "./subscriptions";
export * from "./ticket_messages";
export * from "./tickets";
export * from "./user_achievements";
export * from "./user_tokens";
export * from "./visitor_logs";
export * from "./workspace_members";
export * from "./workspaces";

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización de Esquema**: ((Implementada)) Se ha añadido la exportación de la tabla 'notifications', alineando el contrato de tipos con el esquema real y resolviendo los errores de compilación.
 *
 * @subsection Melhorias Futuras
 * 1. **Generación Automática**: ((Vigente)) Crear un script para generar este archivo y prevenir omisiones manuales.
 */
// lib/types/database/tables/index.ts
