// lib/types/database/tables/index.ts
/**
 * @file index.ts
 * @description Archivo barril para la exportación modular de todos los tipos de tabla.
 *              Actualizado para incluir las nuevas entidades del sistema de templates.
 * @author L.I.A Legacy
 * @version 3.0.0 (Template System Integration)
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
export * from "./notifications";
export * from "./prices";
export * from "./product_categories";
export * from "./products";
export * from "./profiles";
export * from "./site_templates"; // <-- NOVO
export * from "./sites";
export * from "./subscribers";
export * from "./subscriptions";
export * from "./template_categories"; // <-- NOVO
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
 * 1.  **Sincronização de Esquema**: ((Implementada)) Se han añadido las exportaciones para los nuevos tipos `SiteTemplates` y `TemplateCategories`, manteniendo el manifiesto de tipos sincronizado con la base de datos.
 *
 * @subsection Melhorias Futuras
 * 1.  **Generación Automática**: ((Vigente)) O comando `pnpm gen:types:tables` deverá ser atualizado para incluir estas novas tabelas. No entanto, como são tipos manuais, a sua inclusão aqui é a abordagem correta por agora.
 */
// lib/types/database/tables/index.ts
