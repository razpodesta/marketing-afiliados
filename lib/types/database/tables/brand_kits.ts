// lib/types/database/tables/brand_kits.ts
/**
 * @file brand_kits.ts
 * @description Define el contrato de datos atómico para la tabla `brand_kits`.
 *              Permite a los usuarios definir y aplicar su propia identidad de marca a las campañas.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type BrandKits = {
  Row: {
    id: number;
    workspace_id: string;
    name: string;
    colors: Json | null; // Ej: { "primary": "#FFFFFF", "secondary": "#000000" }
    fonts: Json | null; // Ej: { "headings": "font_name", "body": "font_name" }
    logo_url: string | null; // URL a un asset en Supabase Storage
    is_default: boolean;
    created_at: string;
  };
  Insert: {
    id?: number;
    workspace_id: string;
    name: string;
    colors?: Json | null;
    fonts?: Json | null;
    logo_url?: string | null;
    is_default?: boolean;
    created_at?: string;
  };
  Update: {
    id?: number;
    workspace_id?: string;
    name?: string;
    colors?: Json | null;
    fonts?: Json | null;
    logo_url?: string | null;
    is_default?: boolean;
    created_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "brand_kits_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para los kits de marca.
 *              Es una característica premium esencial para agencias y profesionales
 *              que necesitan mantener la consistencia de marca de sus clientes.
 * @propose_new_improvements
 * 1. **Vinculación a Campañas**: Añadir una columna `brand_kit_id: number | null` a la tabla `campaigns` para permitir aplicar un kit de marca específico a cada campaña.
 * 2. **Esquemas Zod para `colors` y `fonts`**: Definir esquemas de Zod para la estructura de los campos JSON y usar `z.infer` para reemplazar el tipo `Json`, garantizando que los datos guardados siempre tengan la forma correcta.
 * 3. **Importación de Fuentes de Google Fonts**: Crear una Server Action que permita a los usuarios importar fuentes directamente desde la API de Google Fonts, guardando la URL del `@import` en el campo `fonts`.
 */
// lib/types/database/tables/brand_kits.ts
