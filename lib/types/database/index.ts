// lib/types/database/index.ts
/**
 * @file lib/types/database/index.ts
 * @description Arquivo "barrel" que monta e exporta a definição de tipo
 *              completa da `Database` a partir de seus módulos especializados.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 2.5.0 (Corrected Table Indexing)
 */
import { type Enums } from "./enums";
import {
  type AcceptWorkspaceInvitation,
  type CreateWorkspaceWithOwner,
} from "./functions";
import * as T from "./tables/index"; // <-- CORREÇÃO: Importar do barrel file correto
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

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Suporte para Múltiplos Schemas: A estrutura atual define apenas o schema `public`. Pode ser estendida para suportar outros schemas Supabase (e.g., `storage` ou `graphql`) adicionando novas chaves ao objeto `Database`.
 * 2. Tipos Compostos: O campo `CompositeTypes` está atualmente vazio. Se tipos compostos forem usados no PostgreSQL, suas definições TypeScript devem ser geradas e importadas aqui para uma cobertura de tipos completa.
 * 3. Script de Verificação de Sincronização: Criar um script de diagnóstico que compare as exportações deste arquivo com o schema real do banco de dados (obtido via introspecção) para alertar sobre qualquer desalinhamento entre os tipos gerados e a realidade do banco de dados.
 */
