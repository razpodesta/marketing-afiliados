// lib/types/database/tables/subscribers.ts
/**
 * @file subscribers.ts
 * @description Define el contrato de datos atómico para la tabla `subscribers`.
 *              Almacenará los correos electrónicos para el boletín de noticias.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type Subscribers = {
  Row: {
    created_at: string;
    email: string;
    id: number;
    name: string | null;
    status: string;
  };
  Insert: {
    created_at?: string;
    email: string;
    id?: number;
    name?: string | null;
    status?: string;
  };
  Update: {
    created_at?: string;
    email?: string;
    id?: number;
    name?: string | null;
    status?: string;
  };
  Relationships: [];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `subscribers`.
 *              Es la base para las campañas de email marketing y comunicaciones.
 * @propose_new_improvements
 * 1. **Campo de Origen (`source`)**: Añadir un campo `source: string` para rastrear de dónde provino la suscripción (ej: 'footer_newsletter', 'signup_checkbox', 'lead_magnet_A').
 * 2. **Campo de Etiquetas (`tags`)**: Incluir un campo `tags: text[]` (array de strings) para permitir la segmentación de la audiencia para campañas de correo electrónico dirigidas.
 * 3. **Relación con `customers`**: Añadir una clave foránea opcional `customer_id` para vincular a un suscriptor con su registro de cliente si se convierte en un usuario de pago.
 */
// lib/types/database/tables/subscribers.ts
