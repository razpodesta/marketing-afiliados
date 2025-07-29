// Ruta: scripts/diagnose-connectivity.ts (REFACTORIZADO)
/**
 * @file diagnose-connectivity.ts
 * @description Aparato de Diagnóstico de Conectividad y Latencia.
 *              Misión: Realizar una prueba pura de conexión a Supabase utilizando
 *              tanto la clave de servicio como la anónima, midiendo el tiempo de
 *              respuesta de una consulta trivial. Es la prueba de "pulso" del sistema.
 * @author L.I.A Legacy
 * @version 1.0.0
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
} = process.env;

/**
 * @description Realiza una prueba de conexión y latencia para un rol específico.
 * @param {SupabaseClient} supabase - La instancia del cliente de Supabase.
 * @param {string} roleName - El nombre del rol que se está probando (ej. "Service Role").
 * @returns {Promise<{status: 'OK' | 'ERROR', message: string, latencyInMs?: number}>}
 */
async function testConnection(supabase: SupabaseClient, roleName: string) {
  const startTime = performance.now();
  try {
    // Realizamos la consulta más simple y rápida posible: 'select 1'.
    // Esto prueba la autenticación y la conectividad de red sin tocar ninguna tabla.
    const { error } = await supabase.rpc("hello_world"); // Asumiendo una función simple que devuelve 'world'

    const latency = Math.round(performance.now() - startTime);

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: "OK" as const,
      message: `Autenticación y conexión exitosas para ${roleName}.`,
      latencyInMs: latency,
    };
  } catch (error: any) {
    const latency = Math.round(performance.now() - startTime);
    return {
      status: "ERROR" as const,
      message: `Fallo la conexión para ${roleName}: ${error.message}`,
      latencyInMs: latency,
    };
  }
}

/**
 * @description Función principal que orquesta las pruebas de diagnóstico.
 */
async function main() {
  console.log("🚀 [DIAGNÓSTICO DE CONECTIVIDAD V1.0] Iniciando...");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Una o más variables de entorno de Supabase no están definidas."
    );
    process.exit(1);
  }

  // --- Prueba 1: Conexión del Backend (Service Role) ---
  console.log("🔬 Probando conexión con Rol de Servicio (Backend)...");
  const supabaseService = createClient(supabaseUrl, serviceKey);
  const serviceResult = await testConnection(supabaseService, "Service Role");
  console.log(`   - Estado: ${serviceResult.status}`);
  console.log(`   - Mensaje: ${serviceResult.message}`);
  console.log(`   - Latencia: ${serviceResult.latencyInMs}ms`);
  console.log("--------------------------------------------------");

  // --- Prueba 2: Conexión del Frontend (Anonymous Role) ---
  console.log("🔬 Probando conexión con Clave Anónima (Frontend)...");
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const anonResult = await testConnection(supabaseAnon, "Anonymous Role");
  console.log(`   - Estado: ${anonResult.status}`);
  console.log(`   - Mensaje: ${anonResult.message}`);
  console.log(`   - Latencia: ${anonResult.latencyInMs}ms`);
  console.log("--------------------------------------------------");

  if (serviceResult.status === "ERROR" || anonResult.status === "ERROR") {
    console.error("\n❌ [FALLO] El diagnóstico de conectividad ha fallado.");
    process.exit(1);
  } else {
    console.log(
      "\n✅ [ÉXITO] El diagnóstico de conectividad ha finalizado con éxito."
    );
  }
}

// Añadimos una función RPC simple en Supabase para la prueba:
// CREATE OR REPLACE FUNCTION hello_world()
// RETURNS TEXT AS $$
// BEGIN
//   RETURN 'world';
// END;
// $$ LANGUAGE plpgsql;

main();
