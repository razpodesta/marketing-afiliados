// scripts/check-db-connection.ts
/**
 * @file Script de Verificación de Base de Datos
 * @description Este script realiza una prueba de conexión básica a Supabase
 * y verifica si puede leer datos de la tabla 'profiles'. Es una herramienta de
 * diagnóstico para asegurar que las variables de entorno y la conexión a la BD
 * están configuradas correctamente.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🚀 Iniciando script de verificación de base de datos...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseServiceKey ||
    supabaseServiceKey === "tu_clave_secreta_de_servicio_de_supabase"
  ) {
    console.error(
      "❌ ERROR: Las variables de entorno de Supabase no están configuradas correctamente en .env.local."
    );
    console.log(
      "   Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY tengan valores reales."
    );
    return;
  }

  console.log("   - Variables de entorno cargadas.");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("   - Cliente de Supabase creado.");

  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, app_role")
      .limit(5);

    if (error) {
      console.error(
        "❌ ERROR al consultar la tabla 'profiles':",
        error.message
      );
      console.log("   Posibles causas:");
      console.log(
        "   1. La clave de servicio (SUPABASE_SERVICE_ROLE_KEY) es incorrecta."
      );
      console.log(
        "   2. La tabla 'profiles' no existe o tiene un nombre diferente."
      );
      console.log(
        "   3. Las políticas de Row Level Security (RLS) están bloqueando el acceso (aunque la clave de servicio debería saltárselas)."
      );
      return;
    }

    console.log("✅ ¡Conexión a la base de datos exitosa!");
    console.log(
      `   - Se encontraron ${profiles.length} perfiles en la base de datos.`
    );

    if (profiles.length > 0) {
      console.log("   - Mostrando algunos perfiles encontrados:");
      console.table(profiles);
    } else {
      console.log(
        "   - La tabla 'profiles' está vacía. ¡Esto es normal si aún no has registrado usuarios!"
      );
    }
  } catch (e) {
    console.error("❌ Ocurrió un error inesperado durante la conexión:", e);
  }
}

main();
