// lib/supabase/middleware.ts
/**
 * @file Cliente de Supabase para el Middleware
 * @description Crea un cliente de Supabase para el Middleware. Se ha corregido un
 * error de sintaxis en la implementación del método `remove` de las cookies.
 *
 * @author Metashark
 * @version 2.1.0 (Cookie Syntax Fix)
 */
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";

export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // CORRECCIÓN: Se ha corregido la sintaxis del objeto para que sea válida.
          // El error estaba en `cookies.set({ value: '', ...options })` que era
          // incorrecto. La forma correcta es pasar un objeto con `name` y `value`.
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Importante: Asegurarse de que la sesión se obtenga para que las cookies se actualicen.
  await supabase.auth.getUser();

  return { supabase, response };
}

/* MEJORAS PROPUESTAS
 * 1. **Gestión de Errores de Red:** Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, el middleware podría fallar. Capturar el error permitiría registrarlo y devolver la respuesta `response` sin interrupciones, manteniendo el sitio parcialmente funcional.
 * 2. **Abstracción de Lógica de Cookies:** Para proyectos más grandes, la lógica de manejo de cookies podría abstraerse en su propia clase o conjunto de funciones para hacerla más reutilizable si otros middlewares necesitaran interactuar con las cookies de la misma manera.
 */
