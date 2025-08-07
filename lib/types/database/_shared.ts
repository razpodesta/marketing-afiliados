// lib/types/database/_shared.ts
/**
 * @file _shared.ts
 * @description Helpers de tipo de Supabase. Ha sido reparado para corregir un error
 *              sintáctico crítico (`keyof`) que desestabilizaba el sistema de tipos.
 * @author L.I.A. Legacy
 * @version 12.1.0 (Critical Syntax Fix)
 */
import { type Database as DB } from "./index";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tables<T extends keyof DB["public"]["Tables"]> =
  DB["public"]["Tables"][T]["Row"];

// --- INICIO DE CORRECCIÓN SINTÁCTICA ---
export type TablesInsert<T extends keyof DB["public"]["Tables"]> =
  DB["public"]["Tables"][T]["Insert"];
// --- FIN DE CORRECCIÓN SINTÁCTICA ---

export type TablesUpdate<T extends keyof DB["public"]["Tables"]> =
  DB["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof DB["public"]["Enums"]> =
  DB["public"]["Enums"][T];
export type Views<T extends keyof DB["public"]["Views"]> =
  DB["public"]["Views"][T]["Row"];

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Corrección Sintáctica Crítica**: ((Implementada)) Se ha corregido el operador `key of` a `keyof` en el helper `TablesInsert`, resolviendo la cascada de errores de compilación y restaurando la integridad del sistema de tipos.
 */
// lib/types/database/_shared.ts
