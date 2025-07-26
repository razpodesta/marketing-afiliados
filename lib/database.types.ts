/* Ruta: lib/database.types.ts */

/**
 * @file database.types.ts
 * @description Blueprint Arquitectónico de la Base de Datos.
 * Este archivo, generado por `supabase gen types`, ha sido restaurado a su
 * estado completo y enriquecido con TSDoc. Define el esquema de datos completo
 * de la aplicación y sirve como la fuente de verdad para la interacción
 * entre el código y la base de datos.
 *
 * @author Metashark (Arquitecto de IA) & Supabase CLI
 * @version 3.1.0 (Syntax Correction & Full Restoration)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          affiliate_url: string | null;
          content: Json | null;
          created_at: string;
          id: string;
          name: string;
          site_id: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          affiliate_url?: string | null;
          content?: Json | null;
          created_at?: string;
          id?: string;
          name: string;
          site_id: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          affiliate_url?: string | null;
          content?: Json | null;
          created_at?: string;
          id?: string;
          name?: string;
          site_id?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          }
        ];
      };
      
      invitations: {
        Row: {
          id: string;
          workspace_id: string;
          invited_by: string;
          invitee_email: string;
          role: Database["public"]["Enums"]["workspace_role"];
          token: string;
          status: "pending" | "accepted" | "expired";
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          invited_by: string;
          invitee_email: string;
          role: Database["public"]["Enums"]["workspace_role"];
          token?: string;
          status?: "pending" | "accepted" | "expired";
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          invited_by?: string;
          invitee_email?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          token?: string;
          status?: "pending" | "accepted" | "expired";
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      pages: {
        Row: {
          campaign_id: string;
          content: Json | null;
          created_at: string;
          id: string;
          type: string;
        };
        Insert: {
          campaign_id: string;
          content?: Json | null;
          created_at?: string;
          id?: string;
          type: string;
        };
        Update: {
          campaign_id?: string;
          content?: Json | null;
          created_at?: string;
          id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles: {
        Row: {
          app_role: Database["public"]["Enums"]["app_role"];
          avatar_url: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          app_role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          app_role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };

      sites: {
        Row: {
          created_at: string;
          custom_domain: string | null;
          icon: string | null;
          id: string;
          subdomain: string | null;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          custom_domain?: string | null;
          icon?: string | null;
          id?: string;
          subdomain?: string | null;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          custom_domain?: string | null;
          icon?: string | null;
          id?: string;
          subdomain?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };

      workspace_members: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["workspace_role"];
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["workspace_role"];
          user_id: string;
          workspace_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
      };

      workspaces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "developer" | "admin" | "user";
      workspace_role: "owner" | "admin" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

  /* MEJORAS FUTURAS DETECTADAS
 * 1. Automatización de Sincronización con CI/CD (CRÍTICO): Para eliminar el riesgo de error humano, es fundamental automatizar la ejecución del script `pnpm run supabase:gen-types`. Se debería configurar un flujo de trabajo de Integración Continua (CI), por ejemplo con GitHub Actions, que se dispare después de cada fusión a la rama principal que contenga una nueva migración de base de datos. Esto garantizaría que este archivo de tipos esté siempre en perfecta sincronía con el esquema de producción.
 * 2. Implementar Triggers de Base de Datos para la Integridad de Datos: Para una arquitectura más robusta, cierta lógica de negocio debería vivir en la base de datos. Se deberían crear triggers de PostgreSQL para tareas como:
 *    - `handle_updated_at`: Un trigger que actualice automáticamente la columna `updated_at` en tablas como `campaigns`, `sites` y `workspaces` cada vez que se modifica una fila.
 *    - `create_profile_on_signup`: Un trigger que, después de que Supabase Auth inserte un nuevo usuario en `auth.users`, cree automáticamente la entrada correspondiente en la tabla `profiles`.
 * 3. Planificación de la Arquitectura de Facturación (Stripe): Para preparar la monetización, el esquema de la base de datos debería ser extendido para incluir las tablas de facturación. Esto incluiría:
 *    - `subscriptions`: Para rastrear el plan activo de cada workspace (`workspace_id`, `stripe_subscription_id`, `status`, `plan_id`).
 *    - `products` y `prices`: Para almacenar localmente los planes y precios de Stripe, que se mantendrían sincronizados mediante webhooks.
 */
/* Ruta: lib/database.types.ts
 * 1. **Automatización de Sincronización:** Es CRÍTICO establecer un flujo de trabajo de CI/CD (ej. con GitHub Actions) que ejecute `pnpm run supabase:gen-types` después de cada fusión a la rama principal que contenga una migración de base de datos. Esto elimina la dependencia de la ejecución manual y previene desincronizaciones futuras.
 * 2. **Implementar Triggers de Base de Datos:** Para garantizar la integridad de los datos, se deben crear triggers en PostgreSQL para tareas como:
 *    - **`handle_updated_at`:** Aplicar este trigger a todas las tablas clave (`campaigns`, `sites`, `workspaces`) para automatizar la actualización de la columna `updated_at`.
 *    - **`create_default_workspace`:** Un trigger que se ejecute después de crear un nuevo usuario en `auth.users` para crearle automáticamente un workspace personal y añadirlo como `owner` en `workspace_members`, automatizando el onboarding.
 * 3. **Arquitectura de Facturación (Stripe):** Planificar la integración de Stripe añadiendo las tablas necesarias a este blueprint. Esto incluiría:
 *    - `subscriptions`: Para rastrear el plan activo de cada workspace (`workspace_id`, `stripe_subscription_id`, `status`, `plan_id`).
 *    - `products` y `prices`: Para almacenar localmente los planes y precios de Stripe, sincronizados mediante webhooks.
 * 1. **Automatización de Tipos con `supabase:gen-types`:** Es CRÍTICO establecer un flujo de trabajo donde el script `pnpm run supabase:gen-types` se ejecute después de cada migración de base de datos. Esto automatiza la sincronización de este archivo, eliminando el riesgo de errores humanos y asegurando que el código siempre refleje el esquema real.
 * 2. **Triggers Automáticos para `updated_at`:** La mejor práctica es mover la lógica de actualización del campo `updated_at` a un trigger de PostgreSQL en la base de datos. Esto garantiza que el campo se actualice de forma fiable independientemente de dónde provenga la modificación, centralizando la lógica de negocio en la capa de datos.
 * 3. **Validación de `content` con Zod:** Crear un `CampaignConfigSchema` en Zod basado en `lib/builder/types.d.ts`. Este esquema debe usarse en la `updateCampaignContentAction` para validar el objeto `content` antes de guardarlo. Esta es una red de seguridad indispensable contra datos corruptos o maliciosos.
 * 1. **Automatización de la Generación de Tipos:** El proceso de actualizar este archivo manualmente es propenso a errores. El script `supabase:gen-types` en `package.json` es la solución correcta. Se debería establecer un flujo de trabajo donde, después de cada migración de base de datos, se ejecute `pnpm run supabase:gen-types` para mantener este archivo siempre sincronizado automáticamente con el esquema real.
 * 2. **Tipos de `Json` más Estrictos:** El tipo `Json` es muy amplio. Para la columna `content`, podríamos definir un tipo más estricto que se alinee con nuestra `CampaignConfig` de `lib/builder/types.d.ts` y usar la aserción de tipos (`as CampaignConfig`) de manera segura después de la validación.
 * 3. **Habilitar `updated_at` Automático en la Base de Datos:** En lugar de gestionar la columna `updated_at` desde el código de la aplicación, es una mejor práctica de base de datos crear un `trigger` de PostgreSQL que actualice automáticamente este campo cada vez que una fila de la tabla `campaigns` es modificada. Esto asegura la integridad del dato independientemente de dónde provenga el cambio.
 */
