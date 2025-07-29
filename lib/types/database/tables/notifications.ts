// lib/types/database/tables/notifications.ts
/**
 * @file notifications.ts
 * @description Define el contrato de datos atómico para la tabla `notifications`.
 *              Gestiona las notificaciones en la aplicación para los usuarios.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type Notifications = {
  Row: {
    id: number;
    user_id: string; // El destinatario de la notificación
    actor_id: string | null; // El usuario que originó la notificación
    type: string; // Ej: "workspace.invitation", "campaign.analysis_complete"
    data: Json | null; // Datos contextuales (ej: { workspaceName: 'Proyecto X' })
    read_at: string | null;
    created_at: string;
  };
  Insert: {
    id?: number;
    user_id: string;
    actor_id?: string | null;
    type: string;
    data?: Json | null;
    read_at?: string | null;
    created_at?: string;
  };
  Update: {
    id?: number;
    user_id?: string;
    actor_id?: string | null;
    type?: string;
    data?: Json | null;
    read_at?: string | null;
    created_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "notifications_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "notifications_actor_id_fkey";
      columns: ["actor_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `notifications`.
 *              Es la base para el centro de notificaciones en tiempo real de la UI.
 * @propose_new_improvements
 * 1. **Notificaciones Push y por Email**: Añadir campos `email_sent_at` y `push_sent_at` para rastrear la entrega a través de diferentes canales y evitar envíos duplicados.
 * 2. **Agrupación de Notificaciones**: Implementar una lógica en la capa de datos que agrupe notificaciones similares (ej. "3 personas comentaron en tu campaña") para evitar abrumar al usuario.
 * 3. **Acciones en Notificaciones**: Expandir el campo `data` para incluir acciones contextuales, como botones `accept_invitation` o `view_campaign`, que se puedan renderizar directamente en la UI de notificaciones.
 */
// lib/types/database/tables/notifications.ts
