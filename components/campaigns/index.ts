// components/campaigns/index.ts
/**
 * @file components/campaigns/index.ts
 * @description Archivo barril para exportar componentes reutilizables de campañas.
 *              Ha sido sincronizado con la arquitectura atómica actual para resolver
 *              una regresión de compilación crítica.
 * @author L.I.A Legacy
 * @version 4.0.0 (Architectural Synchronization)
 */
export * from "./CampaignsPageHeader";
export * from "./CampaignsTableColumns";
export * from "./CreateCampaignForm";

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización Arquitectónica**: ((Implementada)) Se han eliminado las exportaciones de aparatos inexistentes (`CampaignsHeader`, `CampaignsTable`) y se han añadido las exportaciones para los nuevos aparatos atómicos (`CampaignsPageHeader`, `CampaignsTableColumns`), restaurando la integridad del build.
 *
 * @subsection Melhorias Futuras
 * 1. **Script de Verificación de Barrel Files**: ((Vigente)) Considerar la creación de un script de CI que verifique que todos los módulos exportados por los archivos barril existan físicamente en el disco, para prevenir este tipo de regresión en el futuro.
 */
// components/campaigns/index.ts
