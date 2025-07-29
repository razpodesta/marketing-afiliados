// lib/types/database/tables/asset_library.ts
/**
 * @file asset_library.ts
 * @description Define el contrato de datos atómico para la tabla `asset_library`.
 *              Gestiona los archivos multimedia subidos por los usuarios para su uso en campañas.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type AssetLibrary = {
  Row: {
    id: string;
    workspace_id: string;
    user_id: string; // Quién subió el archivo
    file_name: string;
    file_path: string; // Ruta en Supabase Storage
    file_type: string; // ej. 'image/jpeg'
    file_size_kb: number;
    created_at: string;
  };
  Insert: {
    id?: string;
    workspace_id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size_kb: number;
    created_at?: string;
  };
  Update: never; // Los assets son inmutables; las actualizaciones son nuevas subidas.
  Relationships: [
    {
      foreignKeyName: "asset_library_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "asset_library_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `asset_library`.
 *              Actúa como un índice para los archivos almacenados en Supabase Storage,
 *              vinculándolos a un workspace para la gestión de permisos.
 * @propose_new_improvements
 * 1. **Etiquetado de Assets**: Añadir un campo `tags: text[]` para que los usuarios puedan organizar y buscar sus archivos por etiquetas.
 * 2. **Generación de Miniaturas (Thumbnails)**: Usar Supabase Edge Functions para generar automáticamente miniaturas de las imágenes subidas y almacenar sus URLs en un campo `thumbnail_path: string`.
 * 3. **Contador de Uso**: Incluir un campo `usage_count: number` que se incremente cada vez que un asset se utilice en una campaña. Esto ayudaría a identificar los assets más populares y a gestionar la limpieza de los no utilizados.
 */
// lib/types/database/tables/asset_library.ts