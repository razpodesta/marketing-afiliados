// lib/types/database/tables/profiles.ts
/**
 * @file profiles.ts
 * @description Define el contrato de datos atómico para la tabla `profiles`.
 *              Extiende la tabla `auth.users` con metadatos específicos de la aplicación.
 * @author L.I.A Legacy
 * @version 1.1.0 (Inferred Preferences Field)
 */
import { type Json } from "../_shared";
import { type Enums } from "../enums";

export type Profiles = {
  Row: {
    app_role: Enums["app_role"];
    avatar_url: string | null;
    full_name: string | null;
    id: string;
    updated_at: string | null;
    dashboard_layout: Json | null;
    inferred_preferences: Json | null; // <-- NUEVO CAMPO
  };
  Insert: {
    app_role?: Enums["app_role"];
    avatar_url?: string | null;
    full_name?: string | null;
    id: string;
    updated_at?: string | null;
    dashboard_layout?: Json | null;
    inferred_preferences?: Json | null; // <-- NUEVO CAMPO
  };
  Update: {
    app_role?: Enums["app_role"];
    avatar_url?: string | null;
    full_name?: string | null;
    id?: string;
    updated_at?: string | null;
    dashboard_layout?: Json | null;
    inferred_preferences?: Json | null; // <-- NUEVO CAMPO
  };
  Relationships: [
    {
      foreignKeyName: "profiles_id_fkey";
      columns: ["id"];
      isOneToOne: true;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `profiles`.
 *              Se ha añadido el campo `inferred_preferences` para alojar datos de
 *              comportamiento del usuario, que serán capturados por futuros sistemas
 *              de seguimiento y utilizados para personalizar la experiencia.
 * @propose_new_improvements
 * 1. **Esquema Zod para Preferencias**: Crear un `InferredPreferencesSchema` en Zod para dar una estructura y validación al campo JSON, previniendo datos inconsistentes. Por ejemplo: `{ "most_used_module": "string", "preferred_template_category": "string" }`.
 * 2. **Versioning del Esquema de Preferencias**: Incluir una propiedad `version` dentro del objeto JSON de `inferred_preferences` para gestionar futuras actualizaciones del esquema sin romper la compatibilidad con datos antiguos.
 * 3. **Integración con Motor de Personalización**: Conectar la actualización de este campo a un servicio de personalización (interno o externo) que analice los eventos de seguimiento y actualice las preferencias de forma asíncrona.
 */
// lib/types/database/tables/profiles.ts
/**
 * @description Este aparato define la forma de los datos para la tabla `profiles`.
 *              Es la fuente de verdad para la información del usuario más allá de
 *              la autenticación básica, como sus roles y preferencias.
 * @propose_new_improvements
 * 1. **Campo de Preferencias**: Añadir un campo `preferences: Json` para almacenar configuraciones de UI del usuario, como el tema preferido (claro/oscuro) o el estado de la barra lateral (colapsada/expandida).
 * 2. **Último Workspace Activo**: Incluir un campo `last_active_workspace_id: string | null` para recordar el último workspace que visitó el usuario y seleccionarlo por defecto al iniciar sesión.
 * 3. **Timestamp de Onboarding**: Añadir un campo booleano `has_completed_onboarding` para un seguimiento más robusto del proceso de bienvenida de nuevos usuarios.
 */
// lib/types/database/tables/profiles.ts
