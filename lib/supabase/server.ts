// Ruta: lib/supabase/server.ts
/**
 * @file lib/supabase/server.ts
 * @description Crea clientes de Supabase para uso exclusivo en el lado del servidor.
 *
 * @important
 * ESTE MÓDULO UTILIZA `cookies` DE `next/headers` Y SOLO DEBE SER IMPORTADO EN:
 *
 * @author Metashark
 * @version 3.2.0 (Usage Context Clarification)
 */
import { type Database } from "@/lib/types/database";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * @description Crea una instancia del cliente de Supabase para el servidor que opera en nombre del usuario.
 *              Utiliza las cookies de la petición entrante para gestionar la sesión.
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
            // Los Server Components de solo lectura no pueden establecer cookies.
            // Se ignora el error de forma segura.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Los Server Components de solo lectura no pueden establecer cookies.
            // Se ignora el error de forma segura.
          }
        },
      },
    }
  );
}

/**
 * @description Crea una instancia del cliente de Supabase para el servidor con privilegios de administrador.
 *              Utiliza la `SUPABASE_SERVICE_ROLE_KEY` para saltarse las políticas de RLS.
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
            // Los Server Components de solo lectura no pueden establecer cookies.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Los Server Components de solo lectura no pueden establecer cookies.
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Gestión Centralizada de Errores: Crear una función wrapper o una clase de servicio que utilice estos clientes y centralice el manejo de errores y el logging para las llamadas a la base de datos, reduciendo la repetición de bloques try/catch en toda la aplicación.
 * 2. Validación de Variables de Entorno: Implementar una validación de variables de entorno al inicio de la aplicación (usando Zod) para asegurar que las URLs y claves de Supabase estén siempre presentes, evitando fallos en tiempo de ejecución.
 * 3. Inyección de Dependencias: Para arquitecturas más complejas y facilitar las pruebas, se podría implementar un patrón de inyección de dependencias para proporcionar el cliente de Supabase a las funciones de acceso a datos, en lugar de importarlo directamente.
 */
