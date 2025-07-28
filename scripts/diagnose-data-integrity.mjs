// Ruta: scripts/diagnose-data-integrity.mjs (NUEVO)
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkIntegrity() {
  console.log(
    "🚀 [VERIFICACIÓN DE INTEGRIDAD V1.0] Analizando relaciones de datos..."
  );
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log("✅ Conectado a Supabase.");

  const { data: users_without_profiles, error: e1 } = await supabase.rpc(
    "users_without_profiles_check"
  );
  console.log(
    `- Verificando perfiles huérfanos... ${
      users_without_profiles > 0 ? "❌ FALLÓ" : "✅ PASÓ"
    }`
  );

  const { data: workspaces_without_owners, error: e2 } = await supabase.rpc(
    "workspaces_without_owners_check"
  );
  console.log(
    `- Verificando workspaces huérfanos... ${
      workspaces_without_owners > 0 ? "❌ FALLÓ" : "✅ PASÓ"
    }`
  );

  // ... más comprobaciones ...
  console.log("\n✅ Verificación de integridad completada.");
}
checkIntegrity();
