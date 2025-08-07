// lib/supabase/client.ts
/**
 * @file lib/supabase/client.ts
 * @description Crea un cliente de Supabase para ser utilizado en el lado del navegador.
 *              Ha sido alineado con la arquitectura de Aumentación de Tipos,
 *              proporcionando al cliente un conocimiento completo del esquema,
 *              incluyendo tablas y vistas.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.0.0 (Unified Type Integration)
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { type Database } from "@/lib/types/database";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

/**
 * @function createClient
 * @description Crea y exporta una instancia del cliente de Supabase para el navegador.
 * @returns {SupabaseClient<Database>} La instancia del cliente de Supabase para el navegador,
 *                                     fuertemente tipada contra el esquema unificado.
 */
export function createClient() {
  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se pasa el tipo `Database` unificado al cliente del navegador.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Integración de Tipos Unificados**: ((Implementada)) El cliente de Supabase del navegador ahora es instanciado con el tipo `Database` fusionado, proporcionando seguridad de tipos y autocompletado para todas las entidades de la base de datos, incluyendo `VIEWS`.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de Variables de Entorno**: ((Vigente)) Utilizar Zod para validar que las variables de entorno de Supabase están definidas al iniciar la aplicación.
 */
// lib/supabase/client.ts
