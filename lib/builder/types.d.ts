/* Ruta: lib/builder/types.d.ts */

/**
 * @file types.d.ts
 * @description Define las interfaces y tipos de TypeScript que gobiernan la estructura de una campaña.
 * Este archivo actúa como el "contrato de datos" para todo el sistema del constructor,
 * garantizando la coherencia y la seguridad de tipos desde el store de estado, pasando
 * por la base de datos, hasta el renderizado final de los componentes.
 *
 * @author Metashark
 * @version 1.0.0
 */

/**
 * @interface BlockStyles
 * @description Define las propiedades de estilo personalizables que puede tener cada bloque.
 */
export interface BlockStyles {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
}

/**
 * @interface PageBlock
 * @description Representa un único bloque (componente) en la estructura de una página.
 * Es la unidad fundamental de construcción.
 */
export interface PageBlock<T = Record<string, any>> {
  id: string; // ID único para el drag-and-drop, selección y keys de React.
  type: string; // El nombre del componente a renderizar (ej. "Header1", "Hero1").
  props: T; // Props específicas del componente (ej. { title: "Hola", cta: "Comprar" }).
  styles: BlockStyles; // Estilos personalizables aplicados al contenedor del bloque.
}

/**
 * @interface CampaignTheme
 * @description Define los ajustes de tema globales para toda la campaña.
 */
export interface CampaignTheme {
  globalFont: string;
  globalColors: Record<string, string>; // ej. { primary: '#ADFF2F', text: '#FFFFFF' }
}

/**
 * @interface CampaignConfig
 * @description La estructura de datos raíz que representa una campaña completa.
 * Este es el objeto que se guardará en formato JSON en la base de datos.
 */
export interface CampaignConfig {
  id: string; // Coincide con el UUID de la campaña en la tabla `campaigns`.
  name: string;
  theme: CampaignTheme;
  blocks: PageBlock[]; // La secuencia ordenada de bloques que componen la página.
}
/* Ruta: lib/builder/types.d.ts */

/* MEJORAS PROPUESTAS
 * 1. **Tipado Genérico Avanzado para Props:** La prop `props` está tipada como `Record<string, any>`. Se podría mejorar usando genéricos avanzados para que, al definir un `PageBlock`, se pueda especificar el tipo exacto de sus props (ej. `PageBlock<Header1Props>`). Esto proporcionaría una seguridad de tipos aún mayor.
 * 2. **Sistema de Presets de Estilo:** Añadir una propiedad opcional `stylePreset: string` a `BlockStyles`. Esto permitiría a los usuarios elegir entre estilos predefinidos (ej. "Contraste Alto", "Sutil") que apliquen un conjunto de valores de estilo, además de permitir la personalización individual.
 * 3. **Definición de Esquemas de Zod:** Junto a cada tipo, se podría definir un esquema de Zod correspondiente (`PageBlockSchema`, `CampaignConfigSchema`). Esto permitiría validar los datos obtenidos de la base de datos en tiempo de ejecución, asegurando que los datos corruptos o con formato antiguo no rompan la aplicación.
 */
