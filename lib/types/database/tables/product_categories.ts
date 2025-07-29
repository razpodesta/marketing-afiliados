// lib/types/database/tables/product_categories.ts
/**
 * @file product_categories.ts
 * @description Define el contrato de datos atómico para la tabla `product_categories`.
 *              Clasifica los productos en el marketplace de afiliados.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type ProductCategories = {
  Row: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
  Insert: {
    id?: number;
    name: string;
    slug: string;
    description?: string | null;
  };
  Update: {
    id?: number;
    name?: string;
    slug?: string;
    description?: string | null;
  };
  Relationships: [];
};

/**
 * @description Este aparato define una simple tabla de búsqueda para organizar
 *              los productos del marketplace de afiliados.
 * @propose_new_improvements
 * 1. **Jerarquía de Categorías**: Añadir una columna `parent_category_id: number | null` con una auto-referencia para permitir la creación de subcategorías.
 * 2. **Contador de Productos**: Mantener un campo `product_count` que se actualice mediante triggers de base de datos para un conteo eficiente de productos por categoría.
 * 3. **Icono de Categoría**: Incluir un campo `icon_name: string | null` para almacenar el nombre de un icono de Lucide-React y mostrarlo en la UI del marketplace.
 */
// lib/types/database/tables/product_categories.ts
