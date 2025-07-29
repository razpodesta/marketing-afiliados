// lib/types/database/tables/workspace_members.ts
/**
 * @file workspace_members.ts
 * @description Define el contrato de datos atómico para la tabla de unión `workspace_members`.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Enums } from "../enums";

export type WorkspaceMembers = {
  Row: {
    created_at: string;
    id: string;
    role: Enums["workspace_role"];
    user_id: string;
    workspace_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    role?: Enums["workspace_role"];
    user_id: string;
    workspace_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    role?: Enums["workspace_role"];
    user_id?: string;
    workspace_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "workspace_members_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "workspace_members_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la relación muchos-a-muchos entre usuarios (`profiles`) y `workspaces`.
 *              Es la piedra angular del sistema de permisos y colaboración.
 * @propose_new_improvements
 * 1. **Timestamp de Unión**: Añadir un campo `joined_at: string` para registrar cuándo se unió un miembro al workspace.
 * 2. **Estado del Miembro**: Incluir un campo `status: string` (ej: 'active', 'deactivated') para permitir a los administradores desactivar temporalmente el acceso de un miembro sin eliminarlo.
 * 3. **Invitado Por**: Añadir un campo `invited_by: string | null` que sea una clave foránea a `users.id` para rastrear quién invitó a cada miembro.
 */
// lib/types/database/tables/workspace_members.ts
