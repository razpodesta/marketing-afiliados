// lib/types/database/tables/products.ts
/**
 * @file products.ts
 * @description Define el contrato de datos atómico para la tabla `products`.
 *              Almacena los productos de Stripe a los que los usuarios pueden suscribirse.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type Products = {
  Row: {
    active: boolean | null;
    description: string | null;
    id: string;
    image: string | null;
    metadata: Json | null;
    name: string | null;
  };
  Insert: {
    active?: boolean | null;
    description?: string | null;
    id: string;
    image?: string | null;
    metadata?: Json | null;
    name?: string | null;
  };
  Update: {
    active?: boolean | null;
    description?: string | null;
    id?: string;
    image?: string | null;
    metadata?: Json | null;
    name?: string | null;
  };
  Relationships: [];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `products`.
 *              Actúa como la representación interna de los productos definidos en Stripe.
 * @propose_new_improvements
 * 1. **Tipo de Producto**: Añadir un campo `product_type` de tipo ENUM ('subscription', 'one_time') para diferenciar entre modelos de negocio.
 * 2. **Relación con Feature Flags**: Vincular productos a una futura tabla `feature_flags` para un control granular sobre qué características activa cada producto.
 * 3. **Campo `trial_available`**: Añadir un campo booleano `trial_available` para indicar fácilmente si un nuevo cliente puede iniciar un período de prueba para este producto.
 */
// lib/types/database/tables/products.ts
