// lib/types/database/tables/campaigns.ts
/**
 * @file campaigns.ts
 * @description Define el contrato de datos atómico para la tabla `campaigns`.
 *              Esta tabla es el núcleo de las operaciones de marketing, almacenando
 *              el contenido JSON que define la estructura de una landing page.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type Campaigns = {
  Row: {
    content: Json | null;
    created_at: string;
    id: string;
    name: string;
    site_id: string;
    slug: string | null;
    updated_at: string | null;
  };
  Insert: {
    content?: Json | null;
    created_at?: string;
    id?: string;
    name: string;
    site_id: string;
    slug?: string | null;
    updated_at?: string | null;
  };
  Update: {
    content?: Json | null;
    created_at?: string;
    id?: string;
    name?: string;
    site_id?: string;
    slug?: string | null;
    updated_at?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "campaigns_site_id_fkey";
      columns: ["site_id"];
      isOneToOne: false;
      referencedRelation: "sites";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `campaigns`.
 *              Es la única fuente de verdad para esta entidad. Se espera que cualquier
 *              operación de base de datos que involucre campañas se adhiera a esta
 *              estructura para garantizar la integridad de los tipos en todo el sistema.
 * @propose_new_improvements
 * 1. **Tipado Fuerte para `content`**: Reemplazar el tipo genérico `Json` con un tipo inferido de un esquema de Zod (`z.infer<typeof CampaignConfigSchema>`). Esto proporcionaría autocompletado y seguridad de tipos de extremo a extremo para la estructura de la campaña.
 * 2. **Campo de Versión de Esquema**: Añadir una propiedad `schema_version: number` al tipo del `content`. Esto facilitaría la implementación de migraciones de datos en el futuro si la estructura del JSON cambia.
 * 3. **Campo de Estado (`status`)**: Añadir un campo `status` de tipo ENUM (ej: 'draft', 'published', 'archived') para permitir un flujo de trabajo de publicación más robusto para las campañas.
 */
// lib/types/database/tables/campaigns.ts
