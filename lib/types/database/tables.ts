/**
 * @file tables.ts
 * @description Contiene las definiciones de tipo para todas las tablas de la base de datos.
 *              Cada tipo de tabla se exporta individualmente para uso modular.
 * @author Metashark (adaptado de Supabase CLI)
 * @version 1.1.0 (Full Export Fix)
 */

export type Campaigns = {
  // ... (contenido completo de Campaigns)
};
export type Customers = {
  // ... (contenido completo de Customers)
};
export type Invitations = {
  // ... (contenido completo de Invitations)
};
export type Pages = {
  // ... (contenido completo de Pages)
};
export type Prices = {
  // ... (contenido completo de Prices)
};
export type Products = {
  // ... (contenido completo de Products)
};
export type Profiles = {
  // ... (contenido completo de Profiles)
};
export type Sites = {
  // ... (contenido completo de Sites)
};
export type Subscribers = {
  // ... (contenido completo de Subscribers)
};
export type Subscriptions = {
  // ... (contenido completo de Subscriptions)
};
export type WorkspaceMembers = {
  // ... (contenido completo de WorkspaceMembers)
};

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
