// lib/types/database/tables/tickets.ts
/**
 * @file tickets.ts
 * @description Define el contrato de datos atómico para la tabla `tickets`.
 *              Esta es la entidad principal para el sistema de soporte al cliente.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Enums } from "../enums";

export type Tickets = {
  Row: {
    id: number;
    user_id: string;
    workspace_id: string | null;
    subject: string;
    status: Enums["ticket_status"];
    priority: Enums["ticket_priority"];
    created_at: string;
    updated_at: string;
    assigned_to: string | null;
  };
  Insert: {
    id?: number;
    user_id: string;
    workspace_id?: string | null;
    subject: string;
    status?: Enums["ticket_status"];
    priority?: Enums["ticket_priority"];
    created_at?: string;
    updated_at?: string;
    assigned_to?: string | null;
  };
  Update: {
    id?: number;
    user_id?: string;
    workspace_id?: string | null;
    subject?: string;
    status?: Enums["ticket_status"];
    priority?: Enums["ticket_priority"];
    created_at?: string;
    updated_at?: string;
    assigned_to?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "tickets_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "tickets_workspace_id_fkey";
      columns: ["workspace_id"];
      isOneToOne: false;
      referencedRelation: "workspaces";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "tickets_assigned_to_fkey";
      columns: ["assigned_to"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `tickets`.
 *              Se espera que cada ticket esté vinculado a un usuario y, opcionalmente,
 *              a un workspace para proporcionar contexto. La lógica de negocio
 *              gestionará las transiciones de estado y prioridad.
 * @propose_new_improvements
 * 1. **Búsqueda de Texto Completo (Full-Text Search)**: A nivel de base de datos, crear un índice `tsvector` combinando el `subject` y el contenido de los mensajes para permitir búsquedas eficientes y rápidas en los tickets de soporte.
 * 2. **Seguimiento de SLA (Service Level Agreement)**: Añadir columnas como `first_response_at` y `resolved_at` para medir los tiempos de respuesta y resolución, permitiendo generar informes de rendimiento del equipo de soporte.
 * 3. **Vinculación a Entidades Específicas**: Incluir columnas opcionales como `site_id` o `campaign_id` para que los usuarios puedan vincular un ticket de soporte directamente a la entidad con la que tienen un problema, proporcionando un contexto invaluable para los agentes.
 */
// lib/types/database/tables/tickets.ts
