/**
 * @file functions.ts
 * @description Contiene las definiciones de tipo para todas las funciones RPC
 *              (Remote Procedure Call) de la base de datos.
 *              ESTE ARCHIVO ES GENERADO AUTOMÁTICamente. NO LO EDITE MANUALMENTE.
 * @author L.I.A Legacy (Generado por scripts/generate-rpc-types.mjs)
 * @version 2025-08-08T00:43:31.410Z
 */
import { type Json } from "./_shared";

export type Functions = {
  create_workspace_with_owner: {
    Args: { owner_user_id: string; new_workspace_name: string; new_workspace_icon: string };
    Returns: { id: string }[];
  };
  accept_workspace_invitation: {
    Args: {  };
    Returns: Json;
  };
  get_public_table_names: {
    Args: {  };
    Returns: { table_name: any }[];
  };
  get_system_diagnostics: {
    Args: {  };
    Returns: Json;
  };
  execute_sql: {
    Args: {  };
    Returns: undefined;
  };
  reset_for_tests: {
    Args: {  };
    Returns: string;
  };
  delete_all_users_and_data: {
    Args: {  };
    Returns: { deleted_user_id: string }[];
  };
};
