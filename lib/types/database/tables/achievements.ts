// lib/types/database/tables/achievements.ts
/**
 * @file achievements.ts
 * @description Define el contrato de datos atómico para la tabla `achievements`.
 *              Almacena la definición de todos los logros o insignias que los usuarios pueden ganar.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type Json } from "../_shared";
import { type Enums } from "../enums";

export type Achievements = {
  Row: {
    id: number;
    name: string;
    description: string;
    icon_url: string | null;
    type: Enums["achievement_type"];
    criteria: Json; // Ej: { "metric": "campaigns_created", "value": 10 }
    created_at: string;
  };
  Insert: {
    id?: number;
    name: string;
    description: string;
    icon_url?: string | null;
    type: Enums["achievement_type"];
    criteria: Json;
    created_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    description?: string;
    icon_url?: string | null;
    type?: Enums["achievement_type"];
    criteria?: Json;
    created_at?: string;
  };
  Relationships: [];
};

/**
 * @description Este aparato define la forma de los datos para los logros.
 *              El campo `criteria` permite una definición flexible de las condiciones
 *              para desbloquear cada logro.
 * @propose_new_improvements
 * 1. **Sistema de Puntos de Experiencia (XP)**: Añadir un campo `xp_reward: number` a esta tabla para que cada logro otorgue puntos, creando un sistema de progresión de niveles para los usuarios.
 * 2. **Logros Secretos**: Incluir un campo booleano `is_secret` para ocultar ciertos logros hasta que sean desbloqueados, añadiendo un elemento de sorpresa.
 * 3. **Dependencias de Logros**: Añadir una columna `depends_on_achievement_id: number | null` con una auto-referencia para crear cadenas o árboles de logros.
 */
// lib/types/database/tables/achievements.ts
