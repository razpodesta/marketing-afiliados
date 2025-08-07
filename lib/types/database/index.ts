// lib/types/database/index.ts
/**
 * @file index.ts
 * @description Manifiesto de Tipos de Base de Datos Canónico y Ensamblador.
 *              Este aparato fusiona los tipos generados automáticamente con
 *              nuestros tipos definidos manualmente, creando una Única Fuente de
 *              Verdad completa para el esquema de la base de datos.
 * @author L.I.A Legacy
 * @version 10.0.0 (Type Augmentation Architecture)
 */
import { type Database as GeneratedDB } from "./_supabase.generated";
import { type ManualDatabaseDefs } from "./_supabase.manual";

// --- FUSIÓN DE TIPOS (TYPE AUGMENTATION) ---
// Aquí ocurre la "magia". Intersectamos los tipos generados con los manuales.
// TypeScript unirá las propiedades de 'public', fusionando 'Tables' y 'Views'
// en un único objeto `public`.
export type Database = GeneratedDB & ManualDatabaseDefs;

// --- RE-EXPORTACIÓN DE HELPERS ---
// Re-exportamos los helpers y los tipos de vistas que ahora operarán sobre
// el nuevo tipo `Database` completo.
export * from "./_shared";
export * from "./views";

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Arquitectura de Aumentación de Tipos**: ((Implementada)) Se ha implementado un patrón de élite que extiende los tipos autogenerados sin modificarlos, creando una solución robusta y a prueba de builds.
 * 2. **Punto de Importación Único**: ((Implementada)) Este archivo ahora actúa como el único punto de entrada para todos los tipos relacionados con la base de datos, simplificando la arquitectura.
 *
 * @subsection Melhorias Futuras
 * 1. **Generación Automática de `_supabase.manual.ts`**: ((Vigente)) Se podría crear un script personalizado que consulte `information_schema.views` en la base de datos y genere el archivo `_supabase.manual.ts` automáticamente, logrando una automatización del 100%.
 */
// lib/types/database/index.ts
