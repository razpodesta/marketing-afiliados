// lib/types/database/tables/prices.ts
/**
 * @file prices.ts
 * @description Define el contrato de datos atómico para la tabla `prices`.
 *              Almacena la información de los planes de precios de Stripe.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";
import { type Enums } from "../enums";

export type Prices = {
  Row: {
    active: boolean | null;
    currency: string | null;
    description: string | null;
    id: string;
    interval: Enums["subscription_interval"] | null;
    interval_count: number | null;
    metadata: Json | null;
    product_id: string | null;
    trial_period_days: number | null;
    type: Enums["subscription_price_type"] | null;
    unit_amount: number | null;
  };
  Insert: {
    active?: boolean | null;
    currency?: string | null;
    description?: string | null;
    id: string;
    interval?: Enums["subscription_interval"] | null;
    interval_count?: number | null;
    metadata?: Json | null;
    product_id?: string | null;
    trial_period_days?: number | null;
    type?: Enums["subscription_price_type"] | null;
    unit_amount?: number | null;
  };
  Update: {
    active?: boolean | null;
    currency?: string | null;
    description?: string | null;
    id?: string;
    interval?: Enums["subscription_interval"] | null;
    interval_count?: number | null;
    metadata?: Json | null;
    product_id?: string | null;
    trial_period_days?: number | null;
    type?: Enums["subscription_price_type"] | null;
    unit_amount?: number | null;
  };
  Relationships: [
    {
      foreignKeyName: "prices_product_id_fkey";
      columns: ["product_id"];
      isOneToOne: false;
      referencedRelation: "products";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `prices`.
 *              Se espera que esté sincronizado con los datos de precios de Stripe
 *              a través de webhooks para asegurar que la información de facturación
 *              sea siempre precisa.
 * @propose_new_improvements
 * 1. **Campo de Nivel de Plan**: Añadir un campo `plan_tier` de tipo ENUM ('free', 'pro', 'enterprise') para facilitar las consultas de permisos basadas en el nivel del plan.
 * 2. **Campo de Características**: Incluir un campo `features: jsonb` para listar de forma declarativa las características que este precio desbloquea, simplificando la lógica en la UI.
 * 3. **Campo de Archivado**: Añadir un booleano `is_archived` para marcar precios que ya no se ofrecen a nuevos clientes pero que deben mantenerse para los suscriptores existentes, en lugar de simplemente usar `active`.
 */
// lib/types/database/tables/prices.ts
