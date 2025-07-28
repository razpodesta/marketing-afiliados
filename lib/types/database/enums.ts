/**
 * @file enums.ts
 * @description Contiene las definiciones de tipo para todos los ENUMs de la base de datos.
 * @author Metashark (adaptado de Supabase CLI)
 * @version 1.0.0
 */

export type Enums = {
  app_role: "user" | "admin" | "developer";
  subscription_status:
    | "trialing"
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "unpaid";
  workspace_role: "owner" | "admin" | "member";
};
