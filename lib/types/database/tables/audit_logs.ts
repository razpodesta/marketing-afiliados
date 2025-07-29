// lib/types/database/tables/audit_logs.ts
/**
 * @file audit_logs.ts
 * @description Define el contrato de datos atómico para la tabla `audit_logs`.
 *              Esta tabla proporciona un registro de auditoría inmutable de todas las
 *              acciones críticas realizadas en la plataforma, esencial para la seguridad y la depuración.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";

export type AuditLogs = {
  Row: {
    id: number;
    created_at: string;
    actor_id: string | null; // El usuario que realizó la acción
    action: string; // Ej: "user.login", "site.created", "workspace.member.invited"
    target_entity_id: string | null; // El ID del objeto afectado (ej. site_id)
    target_entity_type: string | null; // Ej: "site", "campaign"
    metadata: Json | null; // Detalles adicionales en formato JSON
    ip_address: string | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    actor_id?: string | null;
    action: string;
    target_entity_id?: string | null;
    target_entity_type?: string | null;
    metadata?: Json | null;
    ip_address?: string | null;
  };
  Update: never; // Esta tabla debe ser inmutable (append-only)
  Relationships: [
    {
      foreignKeyName: "audit_logs_actor_id_fkey";
      columns: ["actor_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `audit_logs`.
 *              Es la columna vertebral de la seguridad y la observabilidad del sistema.
 *              Se espera que las Server Actions críticas inserten registros en esta tabla
 *              para crear un rastro auditable.
 * @propose_new_improvements
 * 1. **Visualizador de Logs en `dev-console`**: Crear una interfaz en el panel de desarrollador para buscar, filtrar y visualizar estos logs, permitiendo una rápida investigación de incidentes.
 * 2. **Sistema de Alertas**: Configurar triggers en la base de datos que, ante ciertas acciones críticas (ej. múltiples intentos de login fallidos), envíen una alerta a un canal de monitoreo (ej. Slack).
 * 3. **Retención de Datos**: Implementar una política de retención de datos a nivel de base de datos (usando particionamiento de tablas por fecha) para archivar o eliminar logs antiguos y gestionar el tamaño de la tabla.
 */
// lib/types/database/tables/audit_logs.ts
