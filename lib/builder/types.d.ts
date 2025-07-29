// Ruta: lib/builder/types.d.ts

import { z } from "zod";

/**
 * @file types.d.ts
 * @description Define las interfaces y los esquemas de validación de Zod que
 *              gobiernan la estructura de una campaña. Este archivo actúa como el
 *              "contrato de datos" para todo el sistema del constructor.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Zod Schema Integration)
 */

// --- Esquemas de Validación (Zod) ---

export const BlockStylesSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
});

export const PageBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()), // Permite cualquier objeto como props
  styles: BlockStylesSchema,
});

export const CampaignThemeSchema = z.object({
  globalFont: z.string(),
  globalColors: z.record(z.string()),
});

export const CampaignConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  theme: CampaignThemeSchema,
  blocks: z.array(PageBlockSchema),
});

// --- Tipos de TypeScript (Inferidos y Explícitos) ---

/**
 * @interface BlockStyles
 * @description Define las propiedades de estilo personalizables de un bloque.
 */
export type BlockStyles = z.infer<typeof BlockStylesSchema>;

/**
 * @interface PageBlock
 * @description Representa un único bloque (componente) en la estructura de una página.
 * @template T - El tipo específico de las props para mayor seguridad.
 */
export interface PageBlock<T = Record<string, any>> {
  id: string;
  type: string;
  props: T;
  styles: BlockStyles;
}

/**
 * @interface CampaignTheme
 * @description Define los ajustes de tema globales para toda la campaña.
 */
export type CampaignTheme = z.infer<typeof CampaignThemeSchema>;

/**
 * @interface CampaignConfig
 * @description La estructura de datos raíz que representa una campaña completa.
 */
export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;

/* MEJORAS FUTURAS DETECTADAS
 * 1. Tipado Genérico Avanzado en Esquemas Zod: El esquema `PageBlockSchema` usa `z.record(z.any())` para las props. Se podría crear una función genérica que genere esquemas de bloque específicos, como `createPageBlockSchema<T extends z.ZodTypeAny>(propsSchema: T)`, para validar las props de cada tipo de bloque con su propio esquema de Zod.
 * 2. Sistema de Presets de Estilo: Añadir una propiedad opcional `stylePreset: z.string().optional()` a `BlockStylesSchema`. Esto permitiría a los usuarios elegir entre estilos predefinidos (ej. "Contraste Alto", "Sutil"), además de la personalización individual.
 * 3. Versiones de Esquema: A medida que la aplicación evolucione, la estructura de los bloques puede cambiar. Se podría añadir un campo `version: z.number()` a `PageBlockSchema` y `CampaignConfigSchema` para manejar migraciones de datos de versiones antiguas de la configuración.
 */
