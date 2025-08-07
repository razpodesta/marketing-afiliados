// lib/supabase/middleware.ts
/**
 * @file lib/supabase/middleware.ts
 * @description Crea un cliente de Supabase para uso exclusivo en el Middleware.
 *              Ha sido alineado con la arquitectura de Aumentación de Tipos,
 *              proporcionando al cliente un conocimiento completo del esquema,
 *              incluyendo tablas y vistas.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.0.0 (Unified Type Integration)
 */
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import type { Database } from "@/lib/types/database";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

export async function createClient(
  request: NextRequest,
  existingResponse?: NextResponse
) {
  let response = existingResponse
    ? new NextResponse(existingResponse.body, existingResponse)
    : NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se pasa el tipo `Database` unificado al cliente del middleware.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = new NextResponse(response.body, response);
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = new NextResponse(response.body, response);
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return { supabase, response };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Integración de Tipos Unificados**: ((Implementada)) El cliente de Supabase del middleware ahora es instanciado con el tipo `Database` fusionado, proporcionando seguridad de tipos y autocompletado para todas las entidades de la base de datos, incluyendo `VIEWS`, en el Edge Runtime.
 */
// lib/supabase/middleware.ts
