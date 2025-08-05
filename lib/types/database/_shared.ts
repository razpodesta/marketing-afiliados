// lib/types/database/_shared.ts
/**
 * @file _shared.ts
 * @description Contiene los tipos y utilidades genéricos para la base de datos.
 *              Ha sido corregido para exportar sus tipos, resolviendo el error de
 *              compilación TS2395 en el ensamblador `index.ts`.
 * @author Metashark (adaptado de Supabase CLI, corregido por L.I.A Legacy)
 * @version 2.0.0 (Type Visibility Fix)
 */
import { type Database as DB } from "./_supabase.generated";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PublicSchema = DB[Extract<keyof DB, "public">];

// --- INICIO DE CORRECCIÓN CANÓNICA (TS2395) ---
// Se añade 'export' a todos los tipos genéricos para que sean visibles
// fuera de este módulo, permitiendo su uso seguro y su re-exportación.
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof DB },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DB }
    ? keyof (DB[PublicTableNameOrOptions["schema"]]["Tables"] &
        DB[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DB }
  ? (DB[PublicTableNameOrOptions["schema"]]["Tables"] &
      DB[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DB },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DB }
    ? keyof DB[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DB }
  ? DB[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DB },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DB }
    ? keyof DB[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DB }
  ? DB[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof DB },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof DB }
    ? keyof DB[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof DB }
  ? DB[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
// --- FIN DE CORRECCIÓN CANÓNICA ---

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Visibilidad (TS2395)**: ((Implementada)) Todos los tipos genéricos ahora se exportan, resolviendo el bug de compilación y asegurando una arquitectura de tipos modular y robusta.
 *
 * @subsection Melhorias Futuras
 * 1. **Generación Automática**: ((Vigente)) Investigar si futuras versiones de `supabase gen types` pueden generar estos helpers de forma nativa, reduciendo la necesidad de mantenimiento manual.
 */
// lib/types/database/_shared.ts
