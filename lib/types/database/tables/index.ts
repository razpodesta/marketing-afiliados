// lib/types/database/tables/index.ts
/**
 * @file index.ts
 * @description Archivo barril para la exportación modular de todos los tipos de tabla.
 *              Esta es la fuente de verdad para el ensamblaje de la entidad `Database`.
 * @author L.I.A Legacy
 * @version 1.4.0 (Full System Integration)
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
export * from "./workspace_members";
export * from "./workspaces";

/**
 * @description Este aparato actúa como un manifiesto de exportación para todos los tipos de tabla.
 *              No contiene lógica, solo re-exporta los tipos desde sus archivos atómicos.
 *              Su propósito es mantener la organización y facilitar la importación de
 *              tod os los tipos de tabla con una sola declaración.
 * @propose_new_improvements
 * 1. **Generación Automática**: Crear un script (similar a `generate-actions-barrel.mjs`) que genere automáticamente este archivo barril a partir de los archivos presentes en el directorio. Esto eliminaría la necesidad de actualizarlo manualmente cada vez que se añade una nueva tabla, reduciendo el riesgo de error humano.
 * 2. **Agrupación por Esquema**: Si en el futuro la base de datos utiliza múltiples esquemas (ej. `public`, `billing`), este archivo podría ser estructurado con subdirectorios y exportaciones anidadas para reflejar esa estructura.
 * 3. **Validación de Exportaciones**: El script de generación automática podría incluir un paso de validación que asegure que cada archivo en el directorio exporta un tipo con el nombre esperado, previniendo errores de compilación por inconsistencias de nombrado.
 */
// lib/types/database/tables/index.ts
