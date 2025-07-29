// lib/types/database/tables/affiliate_products.ts
/**
 * @file affiliate_products.ts
 * @description Define el contrato de datos atómico para la tabla `affiliate_products`.
 *              Esta tabla forma el núcleo de un marketplace tipo ClickBank.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Enums } from "../enums";

export type AffiliateProducts = {
  Row: {
    id: number;
    vendor_id: string; // FK a profiles.id
    category_id: number; // FK a product_categories.id
    name: string;
    description: string;
    landing_page_url: string;
    commission_type: Enums["commission_type"];
    commission_rate: number;
    status: Enums["product_status"];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: number;
    vendor_id: string;
    category_id: number;
    name: string;
    description: string;
    landing_page_url: string;
    commission_type: Enums["commission_type"];
    commission_rate: number;
    status?: Enums["product_status"];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    vendor_id?: string;
    category_id?: number;
    name?: string;
    description?: string;
    landing_page_url?: string;
    commission_type?: Enums["commission_type"];
    commission_rate?: number;
    status?: Enums["product_status"];
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "affiliate_products_vendor_id_fkey";
      columns: ["vendor_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "affiliate_products_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "product_categories";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define los productos que los afiliados pueden promocionar.
 *              Actúa como el catálogo central del marketplace interno.
 * @propose_new_improvements
 * 1. **Tabla `affiliate_links`**: Crear una tabla para generar y almacenar enlaces de afiliado únicos por usuario y por producto. Contendría `id`, `affiliate_id`, `product_id`, `unique_code`, y contadores de `clicks` y `conversions`.
 * 2. **Sistema de Calificaciones y Reseñas**: Añadir tablas `product_reviews` para que los afiliados puedan calificar y dejar reseñas de los productos, añadiendo prueba social al marketplace.
 * 3. **Métricas de Rendimiento Agregadas**: Incluir campos denormalizados como `average_conversion_rate` o `earnings_per_click` que se actualicen periódicamente mediante un job de base de datos para ayudar a los afiliados a elegir las mejores ofertas.
 */
// lib/types/database/tables/affiliate_products.ts
