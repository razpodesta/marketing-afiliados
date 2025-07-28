/**
 * @file views.ts
 * @description Contiene las definiciones de tipo para todas las vistas de la base de datos.
 *              Se ha corregido un error de sintaxis que impedía la compilación.
 * @author Metashark (adaptado de Supabase CLI)
 * @version 1.1.0 (Syntax Fix)
 */

import { type Enums } from "./enums";

export type UserProfilesWithEmail = {
  Row: {
    app_role: Enums["app_role"] | null;
    avatar_url: string | null;
    email: string | null;
    full_name: string | null;
    id: string | null;
  };
};
