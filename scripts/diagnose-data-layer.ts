// Ruta: scripts/diagnose-data-layer.ts
/**
 * @file diagnose-data-layer.ts
 * @description Script de diagnóstico para validar la forma de los datos
 *              devueltos por la consulta de sitios con conteo de campañas.
 *              Ayuda a verificar la Hipótesis A.
 *
 * @author Code-Pilot Pro
 * @version 1.0.0
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🚀 Iniciando script de diagnóstico de la capa de datos...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ ERROR: Las variables de entorno de Supabase no están configuradas."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("✅ Cliente de Supabase (admin) creado.");

  try {
    // 1. Obtener un workspaceId válido para la prueba.
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("id")
      .limit(1)
      .single();

    if (wsError || !workspace) {
      console.error(
        "❌ ERROR: No se pudo encontrar un workspace para realizar la prueba.",
        wsError
      );
      process.exit(1);
    }
    const TEST_WORKSPACE_ID = workspace.id;
    console.log(`[INFO] Usando workspace de prueba: ${TEST_WORKSPACE_ID}`);

    // 2. Ejecutar la consulta exacta de `getSitesByWorkspaceId`.
    console.log("[INFO] Ejecutando consulta: sites(*, campaigns(count))...");
    const { data, error, count } = await supabase
      .from("sites")
      .select("*, campaigns(count)")
      .eq("workspace_id", TEST_WORKSPACE_ID)
      .limit(1);

    if (error) {
      console.error("❌ ERROR durante la consulta a Supabase:", error);
      process.exit(1);
    }

    console.log("\n✅ Consulta completada con éxito. Analizando resultados...");
    console.log("========================================================");
    console.log("FORMA DE LOS DATOS CRUDOS DEVUELTOS POR SUPABASE:");
    console.log(JSON.stringify(data, null, 2));
    console.log("========================================================");

    if (data && data.length > 0) {
      const firstSite = data[0];
      console.log("\nAnálisis del primer registro:");
      console.log(`- ¿Tiene la propiedad 'id'?`, "id" in firstSite);
      console.log(
        `- ¿Tiene la propiedad 'subdomain'?`,
        "subdomain" in firstSite
      );
      console.log(
        `- ¿Tiene la propiedad 'campaigns'?`,
        "campaigns" in firstSite
      );
      if ("campaigns" in firstSite && Array.isArray(firstSite.campaigns)) {
        console.log(
          `- ¿'campaigns' es un array?`,
          Array.isArray(firstSite.campaigns)
        );
        console.log(
          `- ¿El primer elemento de 'campaigns' tiene la propiedad 'count'?`,
          firstSite.campaigns.length > 0 && "count" in firstSite.campaigns[0]
        );
      }
    } else {
      console.warn(
        "[WARN] La consulta no devolvió sitios para este workspace. El análisis de la forma de datos no es posible."
      );
    }

    console.log("\n[CONCLUSION] El script ha finalizado.");
  } catch (e) {
    console.error("❌ Ocurrió un error inesperado:", e);
  }
}

main();
