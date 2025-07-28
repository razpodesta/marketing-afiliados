/**
 * @file components/sites/index.ts
 * @description Archivo barril para exportar componentes reutilizables relacionados
 *              con la gestión de sitios.
 * @refactor
 * REFACTORIZACIÓN ESTRUCTURAL: Se eliminó la exportación de `SitesClient`
 * ya que es un componente orquestador que vive en la capa de la aplicación (`app`),
 * no en la de componentes de UI (`components`).
 *
 * @author Metashark
 * @version 1.1.0 (Structural Fix)
 */

export * from "./CreateSiteForm";
export * from "./DeleteSiteDialog";
export * from "./PaginationControls";
export * from "./SiteCard";
export * from "./SitesGrid";
export * from "./SitesHeader";
