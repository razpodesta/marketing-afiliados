// scripts/check-db-connection.ts

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

/**
 * @file Script de Verificación de Base de Datos (Mejorado)
 * @description Realiza una prueba de conexión a Supabase y verifica la
 * existencia y contenido de tablas cruciales como `profiles` y `workspaces`.
 *
 * @author Code-Pilot Pro
 * @version 2.0.0
 */
async function main() {
  console.log("🚀 Iniciando script de verificación de base de datos...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ ERROR: Las variables de entorno de Supabase no están configuradas correctamente."
    );
    return;
  }
  console.log("   - Variables de entorno cargadas.");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("   - Cliente de Supabase creado con Service Role Key.");

  try {
    // 1. Verificar la tabla 'profiles'
    console.log("\n--- Verificando tabla 'profiles' ---");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, app_role")
      .limit(5);

    if (profilesError) {
      console.error(
        "❌ ERROR al consultar la tabla 'profiles':",
        profilesError.message
      );
    } else {
      console.log("✅ Consulta a 'profiles' exitosa.");
      if (profiles.length > 0) {
        console.table(profiles);
      } else {
        console.log(
          "   - La tabla 'profiles' está vacía. Esto es normal si no hay usuarios registrados."
        );
      }
    }

    // 2. Verificar la tabla 'workspaces'
    console.log("\n--- Verificando tabla 'workspaces' ---");
    const { data: workspaces, error: workspacesError } = await supabase
      .from("workspaces")
      .select("id, name, owner_id")
      .limit(5);

    if (workspacesError) {
      console.error(
        "❌ ERROR al consultar la tabla 'workspaces':",
        workspacesError.message
      );
    } else {
      console.log("✅ Consulta a 'workspaces' exitosa.");
      if (workspaces.length > 0) {
        console.table(workspaces);
      } else {
        console.log("   - La tabla 'workspaces' está vacía.");
      }
    }

    console.log("\nVerificación de base de datos completada.");
  } catch (e) {
    console.error("❌ Ocurrió un error inesperado durante la conexión:", e);
  }
}

main();
