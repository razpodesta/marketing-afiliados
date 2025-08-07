// lib/types/database/functions.ts
/**
 * @file functions.ts
 * @description Contiene las definiciones de tipo para todas las funciones RPC
 *              (Remote Procedure Call) de la base de datos.
 * @author L.I.A Legacy
 * @version 2.1.0 (Consistent Naming Convention)
 */
import { type Json } from "./_shared";

export type AcceptWorkspaceInvitation = {
  Args: { invitation_id: string; accepting_user_id: string };
  Returns: Json;
};

export type CreateWorkspaceWithOwner = {
  Args: {
    owner_user_id: string;
    new_workspace_name: string;
    new_workspace_icon: string;
  };
  Returns: { id: string }[];
};

export type DeleteSiteAndDependents = {
  Args: { _site_id: string };
  Returns: { deleted_site_id: string; deleted_campaigns_count: number }[];
};

export type GetSystemDiagnostics = {
  Args: Record<PropertyKey, never>;
  Returns: Json;
};

export type ResetForTests = {
  Args: Record<PropertyKey, never>;
  Returns: string;
};
