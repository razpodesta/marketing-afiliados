// Ruta: lib/types/database/index.ts
/**
 * @file index.ts
 * @description Archivo "barrel" que ensambla y exporta la definición de tipo
 *              completa de la base de datos desde sus módulos especializados.
 * @author Metashark
 * @version 1.2.0 (Accept Invitation RPC)
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
      campaigns: T.Campaigns;
      customers: T.Customers;
      invitations: T.Invitations;
      pages: T.Pages;
      prices: T.Prices;
      products: T.Products;
      profiles: T.Profiles;
      sites: T.Sites;
      subscribers: T.Subscribers;
      subscriptions: T.Subscriptions;
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
