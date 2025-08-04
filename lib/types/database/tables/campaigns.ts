// lib/types/database/tables/campaigns.ts
/**
 * @file campaigns.ts
 * @description Define el contrato de datos atómico para la tabla `campaigns`.
 *              Esta tabla es el núcleo de las operaciones de marketing, almacenando
 *              el contenido JSON que define la estructura de una landing page.
 *              Ha sido refactorizado para incluir el campo `affiliate_url`,
 *              resolviendo una inconsistencia de tipos en toda la aplicación.
 * @author L.I.A Legacy
 * @version 1.1.0 (Schema Alignment)
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
    affiliate_url: string | null; // <-- CORREGIDO: Campo añadido
  };
  Insert: {
    content?: Json | null;
    created_at?: string;
    id?: string;
    name: string;
    site_id: string;
    slug?: string | null;
    updated_at?: string | null;
    affiliate_url?: string | null; // <-- CORREGIDO: Campo añadido
  };
  Update: {
    content?: Json | null;
    created_at?: string;
    id?: string;
    name?: string;
    site_id?: string;
    slug?: string | null;
    updated_at?: string | null;
    affiliate_url?: string | null; // <-- CORREGIDO: Campo añadido
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
 *
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Tipado Fuerte para `content`**: ((Vigente)) Reemplazar el tipo genérico `Json` con un tipo inferido de un esquema de Zod (`z.infer<typeof CampaignConfigSchema>`). Esto proporcionaría autocompletado y seguridad de tipos de extremo a extremo para la estructura de la campaña.
 * 2. **Campo de Versión de Esquema**: ((Vigente)) Añadir una propiedad `schema_version: number` al tipo del `content`. Esto facilitaría la implementación de migraciones de datos en el futuro si la estructura del JSON cambia.
 * 3. **Campo de Estado (`status`)**: ((Vigente)) Añadir un campo `status` de tipo ENUM (ej: 'draft', 'published', 'archived') para permitir un flujo de trabajo de publicación más robusto para las campañas.
 *
 * @subsection Mejoras Implementadas
 * 1. **Alineación de Esquema**: ((Implementada)) Se ha añadido el campo `affiliate_url` para que coincida con el esquema real de la base de datos y la lógica de la aplicación, resolviendo una inconsistencia crítica.
 */
// lib/types/database/tables/campaigns.ts
