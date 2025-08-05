// lib/types/database/tables/sites.ts
/**
 * @file sites.ts
 * @description Define el contrato de datos atómico para la tabla `sites`.
 *              Sincronizado con el esquema remoto para reflejar la nulidad
 *              de `owner_id` y la presencia de todos los campos.
 * @author L.I.A Legacy
 * @version 2.0.0 (Remote Schema Synchronized)
 */
export type Sites = {
  Row: {
    created_at: string;
    custom_domain: string | null;
    description: string | null;
    icon: string | null;
    id: string;
    name: string;
    owner_id: string | null; // CORREGIDO: Ahora es nullable
    subdomain: string | null;
    updated_at: string | null;
    workspace_id: string;
  };
  Insert: {
    created_at?: string;
    custom_domain?: string | null;
    description?: string | null;
    icon?: string | null;
    id?: string;
    name: string;
    owner_id?: string | null; // CORREGIDO: Ahora es nullable
    subdomain?: string | null;
    updated_at?: string | null;
    workspace_id: string;
  };
  Update: {
    created_at?: string;
    custom_domain?: string | null;
    description?: string | null;
    icon?: string | null;
    id?: string;
    name?: string;
    owner_id?: string | null; // CORREGIDO: Ahora es nullable
    subdomain?: string | null;
    updated_at?: string | null;
    workspace_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "sites_owner_id_fkey";
      columns: ["owner_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "sites_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización Completa**: ((Implementada)) Todos los campos (`name`, `description`) están presentes y la nulidad de `owner_id` se refleja correctamente, eliminando el "Schema Drift".
 *
 * @subsection Melhorias Futuras
 * 1. **Estado de Dominio Personalizado**: ((Vigente)) Añadir un campo `custom_domain_status` de tipo ENUM para gestionar el proceso de verificación de dominios.
 */
