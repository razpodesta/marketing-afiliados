// lib/types/database/tables/ticket_messages.ts
/**
 * @file ticket_messages.ts
 * @description Define el contrato de datos atómico para la tabla `ticket_messages`.
 *              Almacena el hilo de conversación para cada ticket de soporte.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type TicketMessages = {
  Row: {
    id: number;
    ticket_id: number;
    user_id: string; // El autor del mensaje
    content: string;
    created_at: string;
    attachments: Json | null; // Array de URLs a archivos en Supabase Storage
  };
  Insert: {
    id?: number;
    ticket_id: number;
    user_id: string;
    content: string;
    created_at?: string;
    attachments?: Json | null;
  };
  Update: {
    id?: number;
    ticket_id?: number;
    user_id?: string;
    content?: string;
    created_at?: string;
    attachments?: Json | null;
  };
  Relationships: [
    {
      foreignKeyName: "ticket_messages_ticket_id_fkey";
      columns: ["ticket_id"];
      isOneToOne: false;
      referencedRelation: "tickets";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "ticket_messages_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para cada mensaje en un ticket.
 *              El campo `attachments` está diseñado para ser flexible y almacenar una
 *              lista de URLs de archivos, como capturas de pantalla o videos,
 *              subidos a Supabase Storage.
 * @propose_new_improvements
 * 1. **Soporte para Mensajes Internos**: Añadir un campo booleano `is_internal_note` para permitir que los agentes de soporte dejen comentarios en un ticket que no son visibles para el cliente.
 * 2. **Reacciones a Mensajes**: Implementar un campo `reactions: Json` para permitir a los usuarios reaccionar a los mensajes con emojis, similar a las aplicaciones de chat modernas.
 * 3. **Soporte para Rich Text/Markdown**: En lugar de texto plano, el campo `content` podría almacenar Markdown. La UI se encargaría de renderizarlo de forma segura, permitiendo a los usuarios formatear su texto con negritas, listas, enlaces, etc.
 */
// lib/types/database/tables/ticket_messages.ts
