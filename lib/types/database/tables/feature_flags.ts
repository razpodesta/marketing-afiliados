// lib/types/database/tables/feature_flags.ts
/**
 * @file feature_flags.ts
 * @description Define el contrato de datos atómico para la tabla `feature_flags`.
 *              Permite la gestión dinámica de características sin necesidad de redespliegues.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type FeatureFlags = {
  Row: {
    id: number;
    name: string; // Ej: "enable_new_dashboard_ui"
    is_active: boolean;
    rollout_percentage: number; // Un valor de 0 a 100
    target_users: string[] | null; // Array de user_ids para un despliegue dirigido
    target_workspaces: string[] | null; // Array de workspace_ids
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: number;
    name: string;
    is_active?: boolean;
    rollout_percentage?: number;
    target_users?: string[] | null;
    target_workspaces?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    is_active?: boolean;
    rollout_percentage?: number;
    target_users?: string[] | null;
    target_workspaces?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `feature_flags`.
 *              Es una herramienta de ingeniería de élite para A/B testing, despliegues
 *              canary y gestión de características en producción.
 * @propose_new_improvements
 * 1. **Integración con `middleware.ts`**: La lógica del middleware debería ser la principal consumidora de esta tabla (con una caché agresiva) para reescribir URLs o modificar respuestas basándose en los flags activos para el usuario/sesión actual.
 * 2. **Panel de Administración de Flags**: Crear una interfaz en el `dev-console` para que los administradores puedan activar/desactivar flags, ajustar porcentajes de despliegue y gestionar listas de usuarios objetivo en tiempo real.
 * 3. **Tipado Automático de Flags**: Crear un script que lea los `name` de esta tabla y genere un tipo de unión de TypeScript (ej. `type AvailableFlags = "enable_new_dashboard" | ...`) para un uso seguro de los flags en el código.
 */
// lib/types/database/tables/feature_flags.ts
