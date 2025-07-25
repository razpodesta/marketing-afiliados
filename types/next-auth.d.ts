// types/next-auth.d.ts
/**
 * @file Type Augmentation for NextAuth
 * @description Este archivo extiende las interfaces por defecto de NextAuth (`User`, `Session`, `JWT`)
 * para incluir nuestro campo personalizado `role`. Esto proporciona seguridad de tipos en toda la
 * aplicación cada vez que accedemos al objeto de sesión.
 *
 * @author Metashark
 * @version 1.1.0 (Syntax Fix)
 */

import type { DefaultUser, DefaultSession } from 'next-auth';
// Asumimos que `database.types.ts` existe en lib/ y exporta este tipo
import type { Database } from '@/lib/database.types';

// Extraemos el tipo ENUM directamente de la definición de la base de datos
type UserRole = Database['public']['Enums']['user_role'];

declare module 'next-auth' {
  /**
   * Extiende la interfaz `User` por defecto.
   * Añadimos el `role` para que esté disponible en el objeto `user` durante los callbacks.
   */
  interface User extends DefaultUser {
    role: UserRole;
  }

  /**
   * Extiende la interfaz `Session` por defecto.
   * Añadimos el `role` al objeto `user` dentro de la sesión, haciéndolo accesible
   * en los componentes de cliente y servidor a través de `auth()` o `useSession()`.
   */
  interface Session extends DefaultSession {
    user: {
      role: UserRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extiende la interfaz `JWT` por defecto.
   * Añadimos el `role` al token para que la información del rol persista
   * entre peticiones y pueda ser usada para poblar el objeto `Session`.
   */
  interface JWT {
    role: UserRole;
  }
}

/* MEJORAS PROPUESTAS
 * 1. **Tenant ID en la Sesión:** A medida que la aplicación crezca, será útil añadir el `tenant_id` del usuario a la sesión para poder filtrar datos eficientemente sin necesidad de consultas adicionales.
 * 2. **Permisos Granulares:** En lugar de un solo `role`, el token podría llevar un array de `permissions: string[]` (ej. `['campaign:create', 'campaign:delete']`) para un control de acceso aún más fino.
 */