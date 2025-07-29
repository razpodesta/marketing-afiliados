// lib/types/database/tables/subscriptions.ts
/**
 * @file subscriptions.ts
 * @description Define el contrato de datos atómico para la tabla `subscriptions`.
 *              Gestiona el estado de las suscripciones de los usuarios a los planes.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";
import { type Enums } from "../enums";

export type Subscriptions = {
  Row: {
    cancel_at: string | null;
    cancel_at_period_end: boolean | null;
    canceled_at: string | null;
    created: string;
    current_period_end: string;
    current_period_start: string;
    ended_at: string | null;
    id: string;
    metadata: Json | null;
    price_id: string | null;
    quantity: number | null;
    status: Enums["subscription_status"] | null;
    trial_end: string | null;
    trial_start: string | null;
    user_id: string;
  };
  Insert: {
    cancel_at?: string | null;
    cancel_at_period_end?: boolean | null;
    canceled_at?: string | null;
    created?: string;
    current_period_end?: string;
    current_period_start?: string;
    ended_at?: string | null;
    id: string;
    metadata?: Json | null;
    price_id?: string | null;
    quantity?: number | null;
    status?: Enums["subscription_status"] | null;
    trial_end?: string | null;
    trial_start?: string | null;
    user_id: string;
  };
  Update: {
    cancel_at?: string | null;
    cancel_at_period_end?: boolean | null;
    canceled_at?: string | null;
    created?: string;
    current_period_end?: string;
    current_period_start?: string;
    ended_at?: string | null;
    id?: string;
    metadata?: Json | null;
    price_id?: string | null;
    quantity?: number | null;
    status?: Enums["subscription_status"] | null;
    trial_end?: string | null;
    trial_start?: string | null;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "subscriptions_price_id_fkey";
      columns: ["price_id"];
      isOneToOne: false;
      referencedRelation: "prices";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "subscriptions_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `subscriptions`.
 *              Es la tabla más crítica para la lógica de negocio y monetización. Se
 *              espera que sea la única fuente de verdad sobre el acceso de un usuario
 *              a las funcionalidades de pago.
 * @propose_new_improvements
 * 1. **Soporte para Suscripciones a Nivel de Workspace**: Añadir una columna `workspace_id` opcional para permitir que las suscripciones se apliquen a todo un equipo en lugar de a un solo usuario.
 * 2. **Proveedor de Pagos**: Incluir un campo `payment_gateway: string` (ej: 'stripe', 'paypal') para permitir la integración con múltiples procesadores de pago en el futuro.
 * 3. **Tipado Fuerte para `metadata`**: Definir un esquema de Zod para el campo `metadata` y usar `z.infer` para reemplazar el tipo `Json` genérico por un tipo específico que refleje los datos que se guardan.
 */
// lib/types/database/tables/subscriptions.ts
