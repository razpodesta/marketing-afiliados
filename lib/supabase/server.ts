// lib/supabase/server.ts
/**
 * @file Supabase Server Client
 * @description Este archivo inicializa y exporta un cliente de Supabase para uso exclusivo
 * en el lado del servidor (Server Components, Server Actions, Route Handlers).
 * Utiliza la clave de servicio (`service_role`), que tiene permisos elevados y
 * puede saltarse las políticas de RLS. Debe usarse con extrema precaución.
 *
 * @author Metashark
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Crea e inicializa un cliente de Supabase para el lado del servidor.
 *
 * Se utilizan las variables de entorno para la configuración, asegurando que las
 * credenciales sensibles como la clave de servicio no se expongan en el lado del cliente.
 *
 * @throws {Error} Si las variables de entorno de Supabase no están definidas.
 * @returns Un cliente de Supabase con permisos de administrador.
 */
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase URL or Service Role Key is not defined in environment variables."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Es importante deshabilitar el auto-refresh en el servidor para evitar
      // que el cliente intente refrescar sesiones inexistentes.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * @description Instancia única (singleton) del cliente de Supabase para el servidor.
 * Se exporta para ser utilizado en toda la lógica de backend de la aplicación.
 */
export const supabase = createServerSupabaseClient();

/* MEJORAS PROPUESTAS
 * 1. **Cliente de Supabase por Petición:** En escenarios más complejos, especialmente con RSC, se podría crear una función `createServerSupabaseClient(cookies)` que lea las cookies de la petición para actuar en nombre del usuario logueado, respetando RLS, en lugar de usar siempre el rol de servicio. Next.js tiene helpers oficiales para esto (`@supabase/ssr`).
 * 2. **Pooling de Conexiones:** Para aplicaciones de muy alto tráfico, investigar soluciones de pooling de conexiones como Supavisor (ofrecido por Supabase) para gestionar eficientemente las conexiones a la base de datos PostgreSQL subyacente.
 */
