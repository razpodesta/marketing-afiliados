// Ruta: lib/supabase/middleware.ts
/**
 * @file lib/supabase/middleware.ts
 * @description Crea un cliente de Supabase para uso exclusivo en el Middleware de Next.js.
 *              Este cliente está diseñado para gestionar la sesión del usuario a través de
 *              las cookies de la petición y la respuesta.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.2.0 (Type Path Correction)
 */
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// CORRECCIÓN CRÍTICA: Se corrige la ruta de importación para apuntar al
// archivo barrel de tipos de la base de datos.
import type { Database } from "@/lib/types/database";

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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la gestión del cliente de Supabase en el middleware.
 *
 * 1.  **Gestión de Errores de Red:** (Revalidado) Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, el middleware podría fallar.
 * 2.  **Abstracción de Lógica de Cookies:** (Revalidado) Para proyectos más grandes, la lógica de manejo de cookies podría abstraerse en su propia clase o conjunto de funciones.
 * 3.  **Logging Mejorado:** Añadir más logging dentro de los manejadores de cookies para depurar problemas de sesión directamente desde los logs del middleware.
 */

/**
 * @fileoverview El aparato `supabase/middleware.ts` crea un cliente de Supabase especializado para el entorno Edge del Middleware de Next.js.
 * @functionality
 * - Utiliza `createServerClient` de `@supabase/ssr` con una configuración de cookies personalizada que lee de `NextRequest` y escribe en `NextResponse`.
 * - Llama a `supabase.auth.getUser()` para refrescar el token de sesión si es necesario y asegurar que las cookies de sesión estén actualizadas en la respuesta saliente.
 * - Devuelve tanto el cliente de Supabase como el objeto `response` actualizado para que el pipeline del middleware pueda continuar.
 * @relationships
 * - Es invocado exclusivamente por el orquestador del middleware en `middleware.ts`.
 * - Depende de `lib/types/database/index.ts` para su contrato de tipos.
 * @expectations
 * - Se espera que este sea el único método para instanciar un cliente de Supabase dentro del middleware. Su correcta implementación es crucial para mantener la sesión del usuario sincronizada entre el cliente, el servidor y Supabase.
 */
// Ruta: lib/supabase/middleware.ts
/* MEJORAS PROPUESTAS
 * 1. **Gestión de Errores de Red:** Envolver la llamada `supabase.auth.getUser()` en un bloque `try/catch`. Si la base de datos de Supabase no está disponible, el middleware podría fallar. Capturar el error permitiría registrarlo y devolver la respuesta `response` sin interrupciones, manteniendo el sitio parcialmente funcional.
 * 2. **Abstracción de Lógica de Cookies:** Para proyectos más grandes, la lógica de manejo de cookies podría abstraerse en su propia clase o conjunto de funciones para hacerla más reutilizable si otros middlewares necesitaran interactuar con las cookies de la misma manera.
 */
