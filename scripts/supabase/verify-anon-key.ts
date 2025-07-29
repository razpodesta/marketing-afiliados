// Ruta: scripts/supabase/verify-anon-key.ts (NUEVO)
/**
 * @file verify-anon-key.ts
 * @description Aparato de diagnóstico para verificar la validez de la clave pública (anónima).
 *              Simula una petición desde el frontend.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

async function verifyAnonKey() {
  console.log("🔬 Verificando NEXT_PUBLIC_SUPABASE_ANON_KEY...");
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ ERROR: URL o Clave Anónima no encontrada en .env.local");
    return process.exit(1);
  }

  try {
    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    // Intentamos leer de 'workspaces', que debería estar protegida por RLS.
    // No esperamos datos, solo que la consulta no devuelva un error de JWT inválido.
    const { error } = await supabase.from("workspaces").select("id").limit(1);

    if (error && error.message.includes("Invalid JWT")) {
      throw new Error(`La clave anónima es inválida: ${error.message}`);
    }

    console.log(
      "✅ [ÉXITO] La clave NEXT_PUBLIC_SUPABASE_ANON_KEY es válida y puede conectarse."
    );
  } catch (e: any) {
    console.error(`❌ [FALLO] ${e.message}`);
    process.exit(1);
  }
}
verifyAnonKey();
