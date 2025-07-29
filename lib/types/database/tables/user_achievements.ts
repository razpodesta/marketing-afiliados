// lib/types/database/tables/user_achievements.ts
/**
 * @file user_achievements.ts
 * @description Define el contrato de datos atómico para la tabla de unión `user_achievements`.
 *              Registra qué logros ha desbloqueado cada usuario.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export type UserAchievements = {
  Row: {
    id: number;
    user_id: string;
    achievement_id: number;
    achieved_at: string;
  };
  Insert: {
    id?: number;
    user_id: string;
    achievement_id: number;
    achieved_at?: string;
  };
  Update: never; // Inmutable: un logro, una vez ganado, no se modifica.
  Relationships: [
    {
      foreignKeyName: "user_achievements_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "user_achievements_achievement_id_fkey";
      columns: ["achievement_id"];
      isOneToOne: false;
      referencedRelation: "achievements";
      referencedColumns: ["id"];
    },
  ];
};

/**
 * @description Este aparato define la relación muchos-a-muchos entre usuarios y logros.
 *              Es una tabla de log inmutable que forma el historial de recompensas del usuario.
 * @propose_new_improvements
 * 1. **Notificación al Desbloquear**: Configurar un trigger en la base de datos que, al insertar una fila en esta tabla, cree una entrada en la tabla `notifications` para informar al usuario en tiempo real que ha ganado una insignia.
 * 2. **Compartir en Redes Sociales**: Añadir un campo `share_token: string | null` que pueda ser utilizado para generar una URL pública única que el usuario pueda compartir para mostrar su logro.
 * 3. **Visibilidad del Perfil**: Vincular esta tabla a la configuración de privacidad del perfil del usuario, permitiéndole elegir si sus logros son públicos o privados.
 */
// lib/types/database/tables/user_achievements.ts
