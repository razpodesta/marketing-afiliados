// Ruta: scripts/diagnose-db-schema.mjs
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

/**
 * @file diagnose-db-schema.mjs
 * @description Script de diagnóstico avanzado que realiza una introspección
 *              de la base de datos PostgreSQL para obtener una radiografía
 *              completa del esquema: tablas, columnas, tipos de datos,
 *              nulabilidad y claves foráneas.
 *
 * @author L.I.A Legacy
 * @version 1.0.0
 */
async function diagnoseSchema() {
  console.log("🚀 Iniciando radiografía del esquema de Supabase...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ ERROR: Variables de entorno de Supabase no configuradas."
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("✅ Conectado a Supabase con rol de servicio.");

  try {
    const { data, error } = await supabase.rpc("get_schema_details");

    if (error) {
      console.error(
        "❌ ERROR al ejecutar la introspección del esquema:",
        error
      );
      console.info(
        "\nSUGERENCIA: Asegúrate de haber creado la función RPC `get_schema_details` en tu base de datos. Puedes encontrar el script SQL en la documentación de L.I.A. o solicitarlo."
      );
      return;
    }

    const tables = data.reduce((acc, row) => {
      acc[row.table_name] = acc[row.table_name] || [];
      acc[row.table_name].push({
        columna: row.column_name,
        tipo_dato: row.data_type,
        "es_nulable?": row.is_nullable,
        default: row.column_default,
        clave_foránea: row.foreign_key_info || "N/A",
      });
      return acc;
    }, {});

    console.log("\n--- 🔬 RADIOGRAFÍA DEL ESQUEMA 'public' ---");
    for (const tableName in tables) {
      console.log(`\n📄 Tabla: ${tableName}`);
      console.table(tables[tableName]);
    }
    console.log("\n✅ Diagnóstico del esquema completado.");
  } catch (e) {
    console.error("❌ Fallo catastrófico durante el diagnóstico:", e);
  }
}

diagnoseSchema();
