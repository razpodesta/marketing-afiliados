// lib/types/database/enums.ts
/**
 * @file enums.ts
 * @description Contiene las definiciones de tipo para todos los ENUMs de la base de datos.
 *              Se han añadido tipos para gamificación y el marketplace de afiliados.
 * @author Metashark (adaptado de Supabase CLI, expandido por L.I.A Legacy)
 * @version 1.3.0 (Gamification & Marketplace Enums)
 */
export type Enums = {
  app_role: "user" | "admin" | "developer";
  subscription_interval: "day" | "week" | "month" | "year";
  subscription_price_type: "one_time" | "recurring";
  subscription_status:
    | "trialing"
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "unpaid";
  workspace_role: "owner" | "admin" | "member" | "editor" | "viewer";
  token_type: "general_purpose" | "image_generation" | "text_analysis";
  ticket_status:
    | "open"
    | "in_progress"
    | "awaiting_reply"
    | "resolved"
    | "closed";
  ticket_priority: "low" | "medium" | "high" | "urgent";
  achievement_type:
    | "onboarding"
    | "creation_milestone"
    | "performance_milestone"
    | "community";
  leaderboard_scope: "global" | "workspace" | "country";
  commission_type: "percentage" | "fixed_amount";
  product_status: "active" | "inactive" | "pending_approval";
};

/**
 * @description Este aparato centraliza todos los tipos ENUM de la base de datos.
 *              Es fundamental para garantizar que los valores de cadena utilizados en
 *              toda la aplicación se adhieran a un conjunto predefinido y válido,
 *              previniendo errores de integridad de datos.
 * @propose_new_improvements
 * 1. **Script de Verificación de Sincronización**: Crear un script de diagnóstico que consulte los tipos ENUM directamente desde `pg_type` en PostgreSQL y los compare con las definiciones en este archivo para detectar desajustes.
 * 2. **Mapeo a Etiquetas Amigables**: Crear un objeto de mapeo en la capa de la UI que traduzca estos valores de ENUM a etiquetas legibles y traducibles para el usuario (ej. `in_progress` -> "En Progreso").
 * 3. **ENUM para `invitations.status`**: Formalizar los estados de invitación ('pending', 'accepted', etc.) en un nuevo tipo ENUM para mejorar la robustez del sistema de invitaciones.
 */
// lib/types/database/enums.ts
