// lib/types/database/tables/profiles.ts
/**
 * @file profiles.ts
 * @description Define el contrato de datos atómico para la tabla `profiles`.
 *              Sincronizado con el esquema remoto para eliminar el campo obsoleto
 *              `inferred_preferences`.
 * @author L.I.A Legacy
 * @version 2.0.0 (Remote Schema Synchronized)
 */
import { type Json } from "../_shared";
import { type Enums } from "../enums";

export type Profiles = {
  Row: {
    app_role: Enums["app_role"];
    avatar_url: string | null;
    dashboard_layout: Json | null;
    full_name: string | null;
    id: string;
    updated_at: string | null;
  };
  Insert: {
    app_role?: Enums["app_role"];
    avatar_url?: string | null;
    dashboard_layout?: Json | null;
    full_name?: string | null;
    id: string;
    updated_at?: string | null;
  };
  Update: {
    app_role?: Enums["app_role"];
    avatar_url?: string | null;
    dashboard_layout?: Json | null;
    full_name?: string | null;
    id?: string;
    updated_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "profiles_id_fkey";
      columns: ["id"];
      isOneToOne: true;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización de Esquema**: ((Implementada)) Se ha eliminado el campo `inferred_preferences` que no existe en la base de datos remota, eliminando la deuda técnica de "schema drift".
 *
 * @subsection Melhorias Futuras
 * 1. **Campo de Preferencias de UI**: ((Vigente)) Considerar añadir un campo `preferences: Json` para almacenar configuraciones del usuario, como el tema preferido (claro/oscuro).
 */
