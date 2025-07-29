// lib/types/database/tables/workspaces.ts
/**
 * @file workspaces.ts
 * @description Define el contrato de datos atómico para la tabla `workspaces`.
 *              Esta es la entidad de más alto nivel para la organización de datos.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type Workspaces = {
  Row: {
    created_at: string;
    current_site_count: number;
    id: string;
    icon: string | null;
    name: string;
    owner_id: string;
    storage_used_mb: number;
    updated_at: string | null;
  };
  Insert: {
    created_at?: string;
    current_site_count?: number;
    id?: string;
    icon?: string | null;
    name: string;
    owner_id: string;
    storage_used_mb?: number;
    updated_at?: string | null;
  };
  Update: {
    created_at?: string;
    current_site_count?: number;
    id?: string;
    icon?: string | null;
    name?: string;
    owner_id?: string;
    storage_used_mb?: number;
    updated_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "workspaces_owner_id_fkey";
      columns: ["owner_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `workspaces`.
 *              Actúa como el contenedor principal para `sites` y `workspace_members`.
 * @propose_new_improvements
 * 1. **Asociación de Plan**: Añadir una columna `plan_id: string | null` que sea una clave foránea a una futura tabla `plans` para gestionar las suscripciones a nivel de workspace.
 * 2. **Límites de Recursos**: Incluir columnas como `max_sites: number` o `max_storage_mb: number` que se puedan configurar según el plan del workspace.
 * 3. **Soft Deletes**: Implementar borrado lógico añadiendo un campo `deleted_at: string | null` para permitir la recuperación de workspaces.
 */
// lib/types/database/tables/workspaces.ts
