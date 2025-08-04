// lib/types/database/functions.ts
/**
 * @file functions.ts
 * @description Contiene las definiciones de tipo para todas las funciones RPC
 *              (Remote Procedure Call) de la base de datos, incluyendo la nueva
 *              función para la eliminación transaccional de sitios.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 1.4.0 (Transactional Delete Site RPC)
 */
import { type Json } from "./_shared";

/**
 * @typedef {object} CreateWorkspaceWithOwner
 * @description Tipado para la función RPC `create_workspace_with_owner`.
 */
export type CreateWorkspaceWithOwner = {
  Args: {
    owner_user_id: string;
    new_workspace_name: string;
    new_workspace_icon: string;
  };
  Returns: { id: string }[];
};

/**
 * @typedef {object} AcceptWorkspaceInvitation
 * @description Tipado para la función RPC `accept_workspace_invitation`.
 */
export type AcceptWorkspaceInvitation = {
  Args: {
    invitation_id: string;
    accepting_user_id: string;
  };
  Returns: Json;
};

/**
 * @typedef {object} DeleteSiteAndDependents
 * @description Tipado para la función RPC `delete_site_and_dependents`.
 */
export type DeleteSiteAndDependents = {
  Args: {
    _site_id: string;
  };
  Returns: {
    deleted_site_id: string;
    deleted_campaigns_count: number;
  }[];
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Generación Automática de Tipos RPC**: ((Vigente)) Investigar si las futuras versiones de `supabase gen types` pueden generar automáticamente los tipos para las funciones RPC, eliminando la necesidad de mantener este archivo manualmente.
 *
 * @subsection Mejoras Implementadas
 * 1. **Tipado de Eliminación Transaccional**: ((Implementada)) Se ha añadido el tipo `DeleteSiteAndDependents` para dar soporte a la nueva función RPC de eliminación segura de sitios.
 */
// lib/types/database/functions.ts
