// lib/types/database/index.ts
/**
 * @file lib/types/database/index.ts
 * @description Archivo "barrel" que monta y exporta la definición de tipo
 *              completa de la `Database` a partir de sus módulos especializados.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.6.0 (Visitor Log Integration)
 */
import { type Enums } from "./enums";
import {
  type AcceptWorkspaceInvitation,
  type CreateWorkspaceWithOwner,
} from "./functions";
import * as T from "./tables/index";
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
      visitor_logs: T.VisitorLogs; // <-- NUEVA TABLA
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
 * @section MEJORA CONTINUA
 * @description Mejoras para la gestión de la infraestructura de tipos.
 *
 * @subsection Mejoras Futuras
 * 1. **Soporte para Múltiples Schemas**: (Vigente) La estructura actual puede ser extendida para soportar otros schemas de Supabase.
 * 2. **Tipos Compostos**: (Vigente) El campo `CompositeTypes` está actualmente vacío. Si se utilizan, sus definiciones deben ser importadas aquí.
 * 3. **Script de Verificación de Sincronización**: (Vigente) Crear un script de diagnóstico que compare las exportaciones de este archivo con el schema real de la base de datos.
 */
// lib/types/database/index.ts
