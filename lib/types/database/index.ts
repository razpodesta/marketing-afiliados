// lib/types/database/index.ts
/**
 * @file index.ts
 * @description Manifiesto de Tipos de Base de Datos.
 *              Corregido para eliminar la tabla obsoleta 'pages', resolver
 *              el error de visibilidad de tipos TS2395 y simplificar su estructura
 *              eliminando declaraciones redundantes.
 * @author L.I.A Legacy
 * @version 3.0.0 (Visibility & Schema Fix)
 */
import { type Enums } from "./enums";
import * as Functions from "./functions";
import * as Tables from "./tables";
import * as Views from "./views";
export * from "./_shared"; // Re-exporta los tipos genéricos para un único punto de importación.

export type Database = {
  public: {
    Tables: {
      achievements: Tables.Achievements["Row"];
      affiliate_products: Tables.AffiliateProducts["Row"];
      asset_library: Tables.AssetLibrary["Row"];
      audit_logs: Tables.AuditLogs["Row"];
      brand_kits: Tables.BrandKits["Row"];
      campaigns: Tables.Campaigns["Row"];
      coupons: Tables.Coupons["Row"];
      custom_blocks: Tables.CustomBlocks["Row"];
      customers: Tables.Customers["Row"];
      feature_flags: Tables.FeatureFlags["Row"];
      invitations: Tables.Invitations["Row"];
      notifications: Tables.Notifications["Row"];
      // pages: Tables.Pages["Row"]; // ELIMINADO
      prices: Tables.Prices["Row"];
      product_categories: Tables.ProductCategories["Row"];
      products: Tables.Products["Row"];
      profiles: Tables.Profiles["Row"];
      sites: Tables.Sites["Row"];
      subscribers: Tables.Subscribers["Row"];
      subscriptions: Tables.Subscriptions["Row"];
      ticket_messages: Tables.TicketMessages["Row"];
      tickets: Tables.Tickets["Row"];
      user_achievements: Tables.UserAchievements["Row"];
      user_tokens: Tables.UserTokens["Row"];
      visitor_logs: Tables.VisitorLogs["Row"];
      workspace_members: Tables.WorkspaceMembers["Row"];
      workspaces: Tables.Workspaces["Row"];
    };
    Views: {
      user_profiles_with_email: Views.UserProfilesWithEmail["Row"];
    };
    Functions: {
      accept_workspace_invitation: Functions.AcceptWorkspaceInvitation;
      create_workspace_with_owner: Functions.CreateWorkspaceWithOwner;
      delete_site_and_dependents: Functions.DeleteSiteAndDependents;
    };
    Enums: {
      app_role: Enums["app_role"];
      subscription_interval: Enums["subscription_interval"];
      subscription_price_type: Enums["subscription_price_type"];
      subscription_status: Enums["subscription_status"];
      workspace_role: Enums["workspace_role"];
      token_type: Enums["token_type"];
      ticket_status: Enums["ticket_status"];
      ticket_priority: Enums["ticket_priority"];
      achievement_type: Enums["achievement_type"];
      leaderboard_scope: Enums["leaderboard_scope"];
      commission_type: Enums["commission_type"];
      product_status: Enums["product_status"];
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Resolución de TS2395**: ((Implementada)) Se ha corregido el error de visibilidad de declaraciones combinadas re-exportando los tipos desde `_shared.ts` y eliminando la declaración duplicada.
 * 2. **Resolución de TS2694**: ((Implementada)) Se ha eliminado la referencia a la tabla obsoleta `pages`, sincronizando este archivo con el resto de la capa de tipos.
 * 3. **Simplificación y DRY**: ((Implementada)) Se ha eliminado el código redundante al final del archivo, haciendo que este manifiesto sea más limpio y mantenible.
 *
 * @subsection Melhorias Futuras
 * 1. **Generación Automática Completa**: ((Vigente)) Investigar herramientas que puedan generar toda la estructura de este archivo a partir del esquema de la base de datos, incluyendo las re-exportaciones.
 */
// lib/types/database/index.ts
