// lib/types/database/tables/pages.ts
/**
 * @file pages.ts
 * @description Define el contrato de datos atómico para la tabla `pages`.
 *              Actualmente marcada como en desuso, su funcionalidad ha sido
 *              absorbida por la entidad `campaigns`.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type Pages = {
  Row: {
    campaign_id: string;
    content: Json | null;
    created_at: string;
    id: string;
    name: string;
    slug: string;
    updated_at: string | null;
  };
  Insert: {
    campaign_id: string;
    content?: Json | null;
    created_at?: string;
    id?: string;
    name: string;
    slug: string;
    updated_at?: string | null;
  };
  Update: {
    campaign_id?: string;
    content?: Json | null;
    created_at?: string;
    id?: string;
    name?: string;
    slug?: string;
    updated_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "pages_campaign_id_fkey";
      columns: ["campaign_id"];
      isOneToOne: false;
      referencedRelation: "campaigns";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `pages`.
 *              Se considera obsoleto y está pendiente de ser eliminado en una
 *              futura migración de base de datos para simplificar el esquema.
 * @propose_new_improvements
 * 1. **Plan de Deprecación Formal**: Crear un script de migración de datos que mueva cualquier información relevante de `pages` a `campaigns` y luego elimine la tabla `pages`.
 * 2. **Auditoría de Dependencias**: Ejecutar una búsqueda en todo el código base para asegurar que ninguna lógica activa siga haciendo referencia a esta tabla antes de su eliminación.
 * 3. **Reutilización para Páginas Estáticas**: Considerar la refactorización de esta tabla para gestionar páginas estáticas del sistema (como `/about`, `/contact`) en lugar de contenido de campañas, dándole un nuevo propósito.
 */
// lib/types/database/tables/pages.ts
