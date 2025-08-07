// components/sites/index.ts
/**
 * @file components/sites/index.ts
 * @description Archivo barril para exportar componentes reutilizables relacionados
 *              con la gestión de sitios. Corrigido para remover a exportação
 *              de um componente movido.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 2.0.0 (Build Regression Fix)
 */
export * from "./CreateSiteForm";
export * from "./DeleteSiteDialog";
// A linha abaixo foi removida para corrigir o erro de build.
// export * from "./PaginationControls";
export * from "./SiteCard";
export * from "./SitesGrid";
export * from "./SitesHeader";
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Correção de Regressão de Build**: ((Implementada)) A exportação incorreta de `PaginationControls` foi removida, resolvendo o erro `Module not found` e restaurando a capacidade de compilar o projeto.
 */
// components/sites/index.ts
