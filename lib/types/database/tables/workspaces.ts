// lib/types/database/tables/workspaces.ts
/**
 * @file workspaces.ts
 * @description Define el contrato de datos atómico para la tabla `workspaces`.
 *              Sincronizado con el esquema remoto para eliminar el campo obsoleto
 *              `storage_used_mb`.
 * @author L.I.A Legacy
 * @version 2.0.0 (Remote Schema Synchronized)
 */
export type Workspaces = {
  Row: {
    created_at: string;
    current_site_count: number;
    id: string;
    icon: string | null;
    name: string;
    owner_id: string;
    updated_at: string | null;
  };
  Insert: {
    created_at?: string;
    current_site_count?: number;
    id?: string;
    icon?: string | null;
    name: string;
    owner_id: string;
    updated_at?: string | null;
  };
  Update: {
    created_at?: string;
    current_site_count?: number;
    id?: string;
    icon?: string | null;
    name?: string;
    owner_id?: string;
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
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización de Esquema**: ((Implementada)) Se ha eliminado el campo `storage_used_mb` que no existe en la base de datos remota, eliminando la deuda técnica de "schema drift".
 *
 * @subsection Melhorias Futuras
 * 1. **Límites de Recursos**: ((Vigente)) Considerar añadir columnas como `max_sites` o `max_members` que se puedan configurar según el plan del workspace.
 */
