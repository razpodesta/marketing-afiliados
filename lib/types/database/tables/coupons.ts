// lib/types/database/tables/coupons.ts
/**
 * @file coupons.ts
 * @description Define el contrato de datos atómico para la tabla `coupons`.
 *              Esta tabla almacena los cupones de descuento y de regalo, actuando
 *              como un espejo de los datos configurados en el procesador de pagos (Stripe).
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type Coupons = {
  Row: {
    id: string;
    code: string;
    status: "active" | "inactive" | "expired";
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    duration: "once" | "repeating" | "forever";
    duration_in_months: number | null;
    max_redemptions: number | null;
    redeem_by: string | null;
    created_at: string;
  };
  Insert: {
    id: string;
    code: string;
    status?: "active" | "inactive" | "expired";
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    duration: "once" | "repeating" | "forever";
    duration_in_months?: number | null;
    max_redemptions?: number | null;
    redeem_by?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    code?: string;
    status?: "active" | "inactive" | "expired";
    discount_type?: "percentage" | "fixed_amount";
    discount_value?: number;
    duration?: "once" | "repeating" | "forever";
    duration_in_months?: number | null;
    max_redemptions?: number | null;
    redeem_by?: string | null;
    created_at?: string;
  };
  Relationships: [];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `coupons`.
 *              Se espera que esta tabla se mantenga sincronizada con un proveedor
 *              de pagos externo como Stripe a través de webhooks para reflejar
 *              el estado real de los cupones.
 * @propose_new_improvements
 * 1. **Tabla de Canjes (`coupon_redemptions`):** Crear una tabla de unión para rastrear qué usuario (`user_id`) canjeó qué cupón (`coupon_id`) y cuándo (`redeemed_at`). Esto es vital para la analítica y para hacer cumplir `max_redemptions`.
 * 2. **Server Action `redeemCouponAction`:** Implementar una Server Action que valide un código de cupón, verifique sus condiciones (ej. no expirado, redenciones disponibles) y lo aplique a la suscripción de un usuario.
 * 3. **Campo `applies_to_products`**: Añadir un campo `product_ids: string[]` para permitir que los cupones se apliquen solo a productos o planes específicos, en lugar de a todos.
 */
// lib/types/database/tables/coupons.ts
