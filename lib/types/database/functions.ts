// Ruta: lib/types/database/functions.ts
/**
 * @file functions.ts
 * @description Contiene las definiciones de tipo para todas las funciones RPC de la base de datos.
 * @author Metashark (adaptado de Supabase CLI)
 * @version 1.2.0 (Accept Invitation RPC)
 */

import { type Json } from "./_shared";

export type CreateWorkspaceWithOwner = {
  Args: {
    owner_user_id: string;
    new_workspace_name: string;
    new_workspace_icon: string;
  };
  Returns: {
    created_at: string;
    current_site_count: number;
    id: string;
    icon: string | null;
    name: string;
    owner_id: string;
    storage_used_mb: number;
    updated_at: string | null;
  }[];
};

export type AcceptWorkspaceInvitation = {
  Args: {
    invitation_id: string;
    accepting_user_id: string;
  };
  Returns: Json;
};
