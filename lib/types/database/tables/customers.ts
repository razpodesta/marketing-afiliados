// lib/types/database/tables/customers.ts
/**
 * @file customers.ts
 * @description Define el contrato de datos atómico para la tabla `customers`.
 *              Actúa como un puente entre los usuarios de la plataforma y los
 *              clientes en el sistema de pagos (Stripe).
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type Customers = {
  Row: {
    id: string;
    stripe_customer_id: string | null;
  };
  Insert: {
    id: string;
    stripe_customer_id?: string | null;
  };
  Update: {
    id?: string;
    stripe_customer_id?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "customers_id_fkey";
      columns: ["id"];
      isOneToOne: true;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `customers`.
 *              Es la única fuente de verdad para la relación entre usuarios y
 *              clientes de Stripe. Se espera que se mantenga sincronizado con
 *              los webhooks y las operaciones de facturación.
 * @propose_new_improvements
 * 1. **Sincronización de Metadatos**: Añadir un campo `metadata: Json` para almacenar información adicional sincronizada desde Stripe, como el método de pago por defecto o el estado del cliente.
 * 2. **Timestamp de Sincronización**: Incluir un campo `last_synced_at: string` para rastrear cuándo fue la última vez que los datos de este cliente se sincronizaron con Stripe.
 * 3. **Índice Único**: Asegurar que la columna `stripe_customer_id` tenga una restricción de unicidad a nivel de base de datos para prevenir la duplicación de clientes.
 */
// lib/types/database/tables/customers.ts
