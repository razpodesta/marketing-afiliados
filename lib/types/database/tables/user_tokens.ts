// lib/types/database/tables/user_tokens.ts
/**
 * @file user_tokens.ts
 * @description Define el contrato de datos atómico para la tabla `user_tokens`.
 *              Esta tabla es fundamental para la monetización basada en el uso,
 *              rastreando los créditos de IA consumibles por cada usuario.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Enums } from "../enums";

export type UserTokens = {
  Row: {
    id: number;
    user_id: string;
    token_type: Enums["token_type"];
    balance: number;
    last_updated_at: string;
  };
  Insert: {
    id?: number;
    user_id: string;
    token_type: Enums["token_type"];
    balance?: number;
    last_updated_at?: string;
  };
  Update: {
    id?: number;
    user_id?: string;
    token_type?: Enums["token_type"];
    balance?: number;
    last_updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "user_tokens_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la forma de los datos para la tabla `user_tokens`.
 *              Se espera que exista una fila por cada tipo de token para cada usuario.
 *              La lógica de negocio (Server Actions) será responsable de deducir
 *              el balance al usar funcionalidades de IA.
 * @propose_new_improvements
 * 1. **Tabla de Transacciones (`token_transactions`):** Crear una tabla de log inmutable que registre cada débito y crédito de tokens (ej. `source: 'purchase'`, `source: 'monthly_grant'`, `source: 'ai_copy_generation'`). Esto es crucial para la auditoría y para que los usuarios puedan ver su historial de uso.
 * 2. **Función RPC `get_user_token_balance`:** Crear una función de base de datos segura que devuelva el balance de un usuario para un tipo de token específico. Esto centraliza la lógica de consulta y puede ser optimizado.
 * 3. **Soporte para Expiración de Tokens:** Añadir una columna `expires_at: string | null` para implementar tokens que expiran, una estrategia común para incentivar el uso (ej. tokens de prueba gratuitos).
 */
// lib/types/database/tables/user_tokens.ts
