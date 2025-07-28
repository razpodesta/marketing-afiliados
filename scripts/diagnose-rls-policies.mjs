// Ruta: scripts/diagnose-rls-policies.mjs (V2.0 - Verbose)
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config({ path: ".env.local" });

async function diagnoseRLS() {
  console.log(
    "🚀 [AUDITORÍA DE SEGURIDAD V2.0] Verificando políticas de RLS..."
  );
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log("✅ Conectado a Supabase.");

  const { data, error } = await supabase.from("pg_policy").select("*");
  if (error) {
    console.error("❌ ERROR al consultar políticas:", error);
    return;
  }

  console.log("\n--- 🛡️ Políticas de RLS Activas Detectadas ---");
  console.table(data);
  console.log("\n✅ Auditoría de RLS completada.");
}
diagnoseRLS();
