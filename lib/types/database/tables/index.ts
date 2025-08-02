// lib/types/database/tables/index.ts
/**
 * @file index.ts
 * @description Archivo barril para la exportación modular de todos los tipos de tabla.
 *              Esta es la fuente de verdad para el ensamblaje de la entidad `Database`.
 * @author L.I.A Legacy
 * @version 1.5.0 (Visitor Log Integration)
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
export * from "./pages";
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
export * from "./visitor_logs"; // <-- NUEVA EXPORTACIÓN
export * from "./workspace_members";
export * from "./workspaces";

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para la gestión de la infraestructura de tipos.
 *
 * @subsection Mejoras Futuras
 * 1. **Generación Automática**: (Vigente) Crear un script que genere automáticamente este archivo barril a partir de los archivos presentes en el directorio para eliminar la necesidad de actualización manual.
 * 2. **Agrupación por Esquema**: (Vigente) Si en el futuro se utilizan múltiples esquemas, este archivo podría ser reestructurado para reflejar esa jerarquía.
 * 3. **Validación de Exportaciones**: (Vigente) El script de generación automática podría incluir validación para asegurar que cada archivo exporta un tipo con el nombre esperado.
 */
// lib/types/database/tables/index.ts
