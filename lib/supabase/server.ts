// Ruta: lib/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Database } from "@/lib/database.types";

/**
 * @file lib/supabase/server.ts
 * @description Crea clientes de Supabase para uso en el lado del servidor.
 * CORREGIDO: Se ha añadido el tercer argumento obligatorio a `createServerClient`
 * en la función `createAdminClient` para un uso sin gestión de sesión.
 *
 * @author Metashark
 * @version 3.1.0 (Admin Client Signature Fix)
 */

/**
 * @description Crea una instancia del cliente de Supabase para el servidor que opera en nombre del usuario.
 * @returns La instancia del cliente de Supabase para el servidor.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorar errores en Server Components de App Router.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignorar errores en Server Components de App Router.
          }
        },
      },
    }
  );
}

/**
 * @description Crea una instancia del cliente de Supabase para el servidor con privilegios de administrador.
 * @returns La instancia del cliente de Supabase de administrador.
 */
export function createAdminClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorar errores en Server Components de App Router.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignorar errores en Server Components de App Router.
          }
        },
      },
      // Configuración para que el cliente de admin no intente gestionar sesiones.
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Gestión Centralizada de Errores:** Crear un wrapper alrededor de las llamadas de Supabase que centralice el manejo de errores y el logging para evitar la repetición de código.
*/
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Gestión Centralizada de Errores:** Crear un wrapper alrededor de las llamadas de Supabase que centralice el manejo de errores y el logging.
*/
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Migración a Base de Datos Real:** Crítico. (Hecho)
2.  **Auto-Registro con OAuth:** Crítico. (Hecho)
3.  **Tipos de Sesión Extendidos:** Crítico. (Implementado a continuación)
4.  **Gestión Centralizada de Errores:** Centralizar el manejo de errores de Supabase en un único lugar.
*/
