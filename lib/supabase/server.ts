// lib/supabase/server.ts
/**
 * @file lib/supabase/server.ts
 * @description Crea clientes de Supabase para uso exclusivo en el lado del servidor.
 *              Ha sido refactorizado para utilizar el tipo `Database` unificado,
 *              proporcionando al cliente de Supabase un conocimiento completo del
 *              esquema, incluyendo tablas y vistas.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Unified Type Integration)
 */
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { type Database } from "@/lib/types/database";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

export function createClient() {
  const cookieStore = cookies();

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se pasa el tipo `Database` unificado al cliente.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorado de forma segura.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignorado de forma segura.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const cookieStore = cookies();
  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se pasa el tipo `Database` unificado al cliente de administrador.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorado de forma segura.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignorado de forma segura.
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

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Integración de Tipos Unificados**: ((Implementada)) Los clientes de Supabase ahora son instanciados con el tipo `Database` fusionado, dándoles visibilidad completa sobre Tablas y Vistas, y resolviendo la causa raíz de los errores de compilación.
 */
// lib/supabase/server.ts
