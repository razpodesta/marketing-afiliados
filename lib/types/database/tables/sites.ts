// lib/types/database/tables/sites.ts
/**
 * @file sites.ts
 * @description Define el contrato de datos atómico para la tabla `sites`.
 *              Cada fila representa un subdominio único dentro de un workspace.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type Sites = {
  Row: {
    created_at: string;
    custom_domain: string | null;
    icon: string | null;
    id: string;
    owner_id: string | null;
    subdomain: string | null;
    updated_at: string | null;
    workspace_id: string;
  };
  Insert: {
    created_at?: string;
    custom_domain?: string | null;
    icon?: string | null;
    id?: string;
    owner_id?: string | null;
    subdomain?: string | null;
    updated_at?: string | null;
    workspace_id: string;
  };
  Update: {
    created_at?: string;
    custom_domain?: string | null;
    icon?: string | null;
    id?: string;
    owner_id?: string | null;
    subdomain?: string | null;
    updated_at?: string | null;
    workspace_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "sites_owner_id_fkey";
      columns: ["owner_id"];
      isOneToOne: false;
      referencedRelation: "users";
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
 * @description Este aparato define la forma de los datos para la tabla `sites`.
 *              Es fundamental para la arquitectura multi-tenant, vinculando un
 *              host (subdominio o dominio personalizado) a un workspace.
 * @propose_new_improvements
 * 1. **Estado de Dominio Personalizado**: Añadir un campo `custom_domain_status` de tipo ENUM (ej: 'pending', 'active', 'error') para gestionar el proceso de verificación de dominios personalizados.
 * 2. **Campo de Analytics**: Incluir un campo `analytics_id: string | null` para asociar el sitio con un proveedor de analíticas de terceros (ej. Google Analytics, Plausible).
 * 3. **Soft Deletes**: Implementar borrado lógico añadiendo un campo `deleted_at: string | null` para permitir la recuperación de sitios eliminados.
 */
// lib/types/database/tables/sites.ts
