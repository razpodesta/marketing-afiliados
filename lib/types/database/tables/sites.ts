// lib/types/database/tables/sites.ts
/**
 * @file sites.ts
 * @description Define el contrato de datos atómico para la tabla `sites`.
 *              Cada fila representa un subdominio único dentro de un workspace.
 *              Ha sido corregido para incluir los campos `name` y `description`.
 * @author L.I.A Legacy
 * @version 1.1.0 (Schema Alignment)
 */
export type Sites = {
  Row: {
    created_at: string;
    custom_domain: string | null;
    description: string | null; // <-- CORRECCIÓN: Campo añadido
    icon: string | null;
    id: string;
    name: string; // <-- CORRECCIÓN: Campo añadido
    owner_id: string | null;
    subdomain: string | null;
    updated_at: string | null;
    workspace_id: string;
  };
  Insert: {
    created_at?: string;
    custom_domain?: string | null;
    description?: string | null; // <-- CORRECCIÓN: Campo añadido
    icon?: string | null;
    id?: string;
    name: string; // <-- CORRECCIÓN: Campo añadido
    owner_id?: string | null;
    subdomain?: string | null;
    updated_at?: string | null;
    workspace_id: string;
  };
  Update: {
    created_at?: string;
    custom_domain?: string | null;
    description?: string | null; // <-- CORRECCIÓN: Campo añadido
    icon?: string | null;
    id?: string;
    name?: string; // <-- CORRECCIÓN: Campo añadido
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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `sites.ts` dentro de la capa de tipos de la base de datos es una
 *               pieza de infraestructura crítica que define el contrato de datos para la
 *               entidad "site".
 *
 * @functionality
 * - **Definición de Contrato:** Define las interfaces `Row`, `Insert`, y `Update` que
 *   TypeScript y Supabase utilizan para la seguridad de tipos en todas las operaciones
 *   de base de datos.
 * - **Corrección de Esquema:** La causa raíz de la cascada de errores de tipo en la
 *   aplicación fue la ausencia de los campos `name` y `description` en esta definición.
 *   Al añadirlos aquí, hemos alineado el contrato de tipos con la realidad del esquema
 *   de la base de datos y la lógica de negocio, resolviendo la inconsistencia fundamental.
 *
 * @relationships
 * - Este tipo es consumido por la capa de datos (ej. `lib/data/sites.ts`) para definir
 *   tipos más complejos como `SiteWithCampaignsCount`.
 * - Es la fuente de verdad última para cualquier operación de base de datos sobre la
 *   tabla `sites`, influyendo en la seguridad de tipos de las Server Actions, hooks y
 *   componentes.
 *
 * @expectations
 * - Se espera que este archivo sea un reflejo 1:1 de la estructura de la tabla `sites`
 *   en PostgreSQL. Cualquier desajuste aquí provocará errores de compilación en toda la
 *   aplicación. Con esta corrección, hemos restaurado la integridad del sistema de tipos.
 * =================================================================================================
 */
