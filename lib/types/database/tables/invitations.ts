// lib/types/database/tables/invitations.ts
/**
 * @file invitations.ts
 * @description Define el contrato de datos atómico para la tabla `invitations`.
 *              Gestiona el flujo de invitaciones de usuarios a workspaces.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Enums } from "../enums";

export type Invitations = {
  Row: {
    created_at: string;
    id: string;
    invitee_email: string;
    invited_by: string;
    role: Enums["workspace_role"];
    status: string;
    updated_at: string;
    workspace_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    invitee_email: string;
    invited_by: string;
    role: Enums["workspace_role"];
    status?: string;
    updated_at?: string;
    workspace_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    invitee_email?: string;
    invited_by?: string;
    role?: Enums["workspace_role"];
    status?: string;
    updated_at?: string;
    workspace_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "invitations_invited_by_fkey";
      columns: ["invited_by"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "invitations_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `invitations`.
 *              Es crucial para la funcionalidad de colaboración. Se espera que el
 *              campo `status` sea gestionado por el sistema para rastrear el ciclo de
 *              vida de una invitación ('pending', 'accepted', 'declined', 'expired').
 * @propose_new_improvements
 * 1. **Tipo ENUM para `status`**: Convertir el campo `status` de `string` a un tipo ENUM de base de datos para garantizar la integridad de los datos.
 * 2. **Fecha de Expiración**: Añadir un campo `expires_at: string` para que las invitaciones puedan invalidarse automáticamente después de un período de tiempo.
 * 3. **Token de Invitación**: Incluir un campo `token: string` con un índice único para permitir la aceptación de invitaciones a través de un enlace seguro sin necesidad de que el usuario haya iniciado sesión.
 */
// lib/types/database/tables/invitations.ts
