// Ruta: lib/supabase/client.ts

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "@/lib/database.types";

/**
 * @file lib/supabase/client.ts
 * @description Crea un cliente de Supabase para ser utilizado en el lado del navegador (Componentes de Cliente).
 * Esta es la única fuente para crear clientes de Supabase en el frontend.
 *
 * @author Metashark
 * @version 3.0.0 (Corrección de Exportación)
 */

/**
 * @description Crea y exporta una instancia del cliente de Supabase para el navegador.
 * La función `createClient` es el punto de entrada unificado para interactuar con Supabase desde el cliente.
 * @returns La instancia del cliente de Supabase para el navegador.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Validación de Variables de Entorno:** Utilizar Zod en el lado del servidor para validar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están definidas al iniciar la aplicación.
*/
