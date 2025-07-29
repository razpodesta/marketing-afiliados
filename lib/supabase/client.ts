// Ruta: lib/supabase/client.ts
/**
 * @file lib/supabase/client.ts
 * @description Crea un cliente de Supabase para ser utilizado en el lado del navegador (Componentes de Cliente).
 *              Esta es la única fuente para crear clientes de Supabase en el frontend,
 *              asegurando una configuración consistente y tipada.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.1.0 (Type Path Correction)
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";

// CORRECCIÓN CRÍTICA: Se corrige la ruta de importación para apuntar al
// archivo barrel de tipos de la base de datos.
import { type Database } from "@/lib/types/database";

/**
 * @description Crea y exporta una instancia del cliente de Supabase para el navegador.
 *              La función `createClient` es el punto de entrada unificado para interactuar
 *              con Supabase desde cualquier Componente de Cliente.
 * @returns {SupabaseClient<Database>} La instancia del cliente de Supabase para el navegador,
 *                                     fuertemente tipada contra el esquema de nuestra base de datos.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la gestión del cliente de Supabase.
 *
 * 1.  **Validación de Variables de Entorno:** (Revalidado) Utilizar Zod en el lado del servidor para validar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están definidas al iniciar la aplicación, previniendo fallos de configuración en tiempo de ejecución.
 * 2.  **Gestión de Clientes Múltiples:** Si la aplicación necesitara conectarse a múltiples proyectos de Supabase, esta función podría ser parametrizada para aceptar las credenciales y devolver el cliente correspondiente.
 * 3.  **Singleton Pattern (Opcional):** Para asegurar que solo exista una instancia del cliente en toda la aplicación cliente, se podría implementar un patrón Singleton, aunque el hook `useState` o `useMemo` en los componentes que lo usan suele ser suficiente.
 */

/**
 * @fileoverview El aparato `supabase/client.ts` es el único responsable de crear instancias del cliente de Supabase para el navegador.
 * @functionality
 * - Utiliza `createBrowserClient` de `@supabase/ssr` para generar un cliente optimizado para el entorno del cliente.
 * - Lee las variables de entorno públicas (`NEXT_PUBLIC_*`) para configurar la conexión.
 * - Aplica el tipo `Database` genérico al cliente, lo que proporciona seguridad de tipos y autocompletado en todo el código que utiliza este cliente.
 * @relationships
 * - Es importado por cualquier Componente de Cliente que necesite realizar una consulta a Supabase (ej. `LoginForm.tsx`, `useRealtimeInvitations.ts`).
 * - Depende de `lib/types/database/index.ts` para su contrato de tipos.
 * @expectations
 * - Se espera que este sea el único archivo que cree un cliente de Supabase para el navegador. Centralizar la creación aquí asegura que todos los componentes usen la misma configuración y estén correctamente tipados.
 */
// Ruta: lib/supabase/client.ts
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Validación de Variables de Entorno:** Utilizar Zod en el lado del servidor para validar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están definidas al iniciar la aplicación.
*/
