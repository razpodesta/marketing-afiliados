// lib/types/database/tables/visitor_logs.ts
/**
 * @file visitor_logs.ts
 * @description Define el contrato de datos atómico para la tabla `visitor_logs`.
 *              Esta tabla es la base para la inteligencia de visitante y la prevención
 *              de fraude, registrando información clave de cada sesión.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type VisitorLogs = {
  Row: {
    id: string;
    session_id: string;
    user_id: string | null;
    fingerprint: string;
    ip_address: string;
    geo_data: Json | null;
    user_agent: string | null;
    utm_params: Json | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    session_id: string;
    user_id?: string | null;
    fingerprint: string;
    ip_address: string;
    geo_data?: Json | null;
    user_agent?: string | null;
    utm_params?: Json | null;
    created_at?: string;
  };
  Update: never; // Los logs son inmutables (append-only).
  Relationships: [
    {
      foreignKeyName: "visitor_logs_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la inteligencia de visitante.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Detección de Bots**: Añadir un campo `is_bot: boolean` que podría ser poblado analizando el `user_agent`. Esto permitiría filtrar el tráfico de bots de los análisis de comportamiento.
 * 2. **Seguimiento de Referencia (Referrer)**: Incluir un campo `referrer_url: string | null` para almacenar la URL desde la cual el visitante llegó al sitio, proporcionando datos valiosos sobre las fuentes de tráfico.
 * 3. **Página de Aterrizaje (Landing Page)**: Añadir un campo `landing_page: string` para registrar la primera URL que el visitante vio en su sesión. Esto es clave para entender qué páginas son las puertas de entrada más efectivas.
 */
// lib/types/database/tables/visitor_logs.ts
