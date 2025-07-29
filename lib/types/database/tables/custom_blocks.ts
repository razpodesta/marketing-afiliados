// lib/types/database/tables/custom_blocks.ts
/**
 * @file custom_blocks.ts
 * @description Define el contrato de datos atómico para la tabla `custom_blocks`.
 *              Permite a los usuarios guardar bloques personalizados para reutilizarlos en el constructor.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type CustomBlocks = {
  Row: {
    id: number;
    workspace_id: string;
    user_id: string;
    block_type: string; // El tipo de bloque original (ej. 'Hero1')
    block_data: Json; // El objeto completo de props y styles del bloque
    preview_image_url: string | null;
    name: string;
    created_at: string;
  };
  Insert: {
    id?: number;
    workspace_id: string;
    user_id: string;
    block_type: string;
    block_data: Json;
    preview_image_url?: string | null;
    name: string;
    created_at?: string;
  };
  Update: {
    id?: number;
    workspace_id?: string;
    user_id?: string;
    block_type?: string;
    block_data?: Json;
    preview_image_url?: string | null;
    name?: string;
    created_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "custom_blocks_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "custom_blocks_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `custom_blocks`.
 *              Es una característica de productividad clave que permite a los usuarios
 *              crear su propia biblioteca de componentes.
 * @propose_new_improvements
 * 1. **Compartir Bloques**: Añadir una columna `is_shared: boolean` para permitir que los bloques personalizados se compartan con todo el workspace en lugar de ser solo para el usuario que los creó.
 * 2. **Generación Automática de Previsualización**: Implementar una Edge Function que tome el `block_data`, lo renderice en un entorno headless (con Puppeteer), y genere una imagen de previsualización para `preview_image_url`.
 * 3. **Tipado Fuerte para `block_data`**: Usar `z.infer<typeof PageBlockSchema>` para reemplazar el tipo `Json` genérico, garantizando la integridad de los datos guardados.
 */
// lib/types/database/tables/custom_blocks.ts
