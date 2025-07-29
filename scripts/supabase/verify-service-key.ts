// Ruta: scripts/supabase/verify-service-key.ts (NUEVO)
/**
 * @file verify-service-key.ts
 * @description Aparato de diagnóstico para verificar la validez de la clave de servicio (secreta).
 *              Simula una petición desde el backend con privilegios de administrador.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

async function verifyServiceKey() {
  console.log("🔬 Verificando SUPABASE_SERVICE_ROLE_KEY...");
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "❌ ERROR: URL o Clave de Servicio no encontrada en .env.local"
    );
    return process.exit(1);
  }

  try {
    const supabaseAdmin = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    // La prueba canónica de una clave de servicio es leer de un esquema protegido como 'auth'.
    const { error } = await supabaseAdmin
      .from("users")
      .select("id")
      .in("schema", ["auth"])
      .limit(1);

    if (error) {
      throw new Error(
        `La clave de servicio es inválida o no tiene permisos: ${error.message}`
      );
    }

    console.log(
      "✅ [ÉXITO] La clave SUPABASE_SERVICE_ROLE_KEY es válida y tiene privilegios de servicio."
    );
  } catch (e: any) {
    console.error(`❌ [FALLO] ${e.message}`);
    process.exit(1);
  }
}
verifyServiceKey();
