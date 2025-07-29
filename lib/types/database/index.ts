// lib/types/database/index.ts
/**
 * @file index.ts
 * @description Archivo "barrel" que ensambla y exporta la definición de tipo
 *              completa de la `Database` a partir de sus módulos especializados.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.4.0 (Full System Schema Integration)
 */
import { type Enums } from "./enums";
import {
  type AcceptWorkspaceInvitation,
  type CreateWorkspaceWithOwner,
} from "./functions";
import * as T from "./tables";
import { type UserProfilesWithEmail } from "./views";

export * from "./_shared";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      achievements: T.Achievements;
      affiliate_products: T.AffiliateProducts;
      asset_library: T.AssetLibrary;
      audit_logs: T.AuditLogs;
      brand_kits: T.BrandKits;
      campaigns: T.Campaigns;
      coupons: T.Coupons;
      custom_blocks: T.CustomBlocks;
      customers: T.Customers;
      feature_flags: T.FeatureFlags;
      invitations: T.Invitations;
      notifications: T.Notifications;
      pages: T.Pages;
      prices: T.Prices;
      product_categories: T.ProductCategories;
      products: T.Products;
      profiles: T.Profiles;
      sites: T.Sites;
      subscribers: T.Subscribers;
      subscriptions: T.Subscriptions;
      ticket_messages: T.TicketMessages;
      tickets: T.Tickets;
      user_achievements: T.UserAchievements;
      user_tokens: T.UserTokens;
      workspace_members: T.WorkspaceMembers;
      workspaces: T.Workspaces;
    };
    Views: {
      user_profiles_with_email: UserProfilesWithEmail;
    };
    Functions: {
      create_workspace_with_owner: CreateWorkspaceWithOwner;
      accept_workspace_invitation: AcceptWorkspaceInvitation;
    };
    Enums: Enums;
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/**
 * @description Este aparato es el ensamblador final del tipo `Database`. Su única
 *              responsabilidad es importar todas las piezas atómicas (tablas, vistas,
 *              funciones, enums) desde sus respectivos módulos y combinarlas en una
 *              única exportación `Database` que será utilizada por la CLI y los
 *              clientes de Supabase para obtener un tipado fuerte en todo el sistema.
 * @propose_new_improvements
 * 1. **Soporte para Múltiples Esquemas**: La estructura actual solo define el esquema `public`. Se puede extender para soportar otros esquemas de Supabase (como `storage` o `graphql`) añadiendo nuevas claves al objeto `Database`.
 * 2. **Tipos Compuestos**: El campo `CompositeTypes` está actualmente vacío. Si se utilizan tipos compuestos en PostgreSQL, sus definiciones de TypeScript deberían ser generadas e importadas aquí para una cobertura de tipos completa.
 * 3. **Script de Verificación de Sincronización**: Crear un script de diagnóstico que compare las exportaciones de este archivo con el esquema real de la base de datos (obtenido vía introspección) para alertar sobre cualquier desajuste entre los tipos generados y la realidad de la base de datos.
 */
// lib/types/database/index.ts
