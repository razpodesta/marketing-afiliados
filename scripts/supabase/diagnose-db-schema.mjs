// Ruta: scripts/supabase/diagnose-db-schema.mjs (SIMPLIFICADO)
/**
 * @file diagnose-db-schema.mjs
 * @description Aparato de Diagnóstico de Esquema de Base de Datos.
 * @dependency Las variables de entorno deben ser precargadas por el ejecutor
 *             (ej. `node -r dotenv/config`).
 * @author L.I.A Legacy
 * @version 2.1.0 (Environment Loading Decoupled)
 */

import { createClient } from "@supabase/supabase-js";

// Las variables de entorno ahora son leídas directamente desde process.env
// asumiendo que han sido precargadas.
const {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
} = process.env;

const SQL_FOR_RPC_FUNCTION = `
CREATE OR REPLACE FUNCTION get_schema_details()
RETURNS TABLE(
    table_name text,
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    foreign_key_info text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.table_name::text,
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        (SELECT
            '-> ' || ccu.table_name || '(' || ccu.column_name || ')'
         FROM information_schema.key_column_usage AS kcu
         JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = kcu.constraint_name
         WHERE kcu.table_schema = c.table_schema
           AND kcu.table_name = c.table_name
           AND kcu.column_name = c.column_name
           AND kcu.constraint_name IN (SELECT constraint_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY')
        )::text AS foreign_key_info
    FROM
        information_schema.columns c
    WHERE
        c.table_schema = 'public'
    ORDER BY
        c.table_name,
        c.ordinal_position;
END;
$$ LANGUAGE plpgsql;
`;

/**
 * @description Función principal que orquesta el diagnóstico del esquema.
 */
async function diagnoseSchema() {
  console.log("🚀 [RADIOGRAFÍA DE ESQUEMA V2.1] Iniciando...");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están definidas."
    );
    console.info(
      "   Asegúrate de que el comando se ejecuta con '-r dotenv/config'."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    console.log(
      "🔬 Ejecutando función de introspección RPC 'get_schema_details'..."
    );
    const { data, error } = await supabase.rpc("get_schema_details");

    if (error) {
      if (error.code === "42883") {
        console.error(
          "\n❌ ERROR DE DEPENDENCIA: La función RPC 'get_schema_details' no se encontró."
        );
        console.info(
          "\n🛠️ ACCIÓN REQUERIDA: Corre el siguiente script SQL en tu editor de Supabase:"
        );
        console.log("\n-- INICIO DEL SCRIPT SQL --");
        console.log(SQL_FOR_RPC_FUNCTION);
        console.log("-- FIN DEL SCRIPT SQL --\n");
      } else {
        console.error(
          "❌ ERROR al ejecutar la introspección del esquema:",
          error.message
        );
      }
      throw new Error("Fallo en la introspección RPC.");
    }

    console.log(
      "✅ Introspección completada. Procesando y formateando el informe..."
    );

    const tables = data.reduce((acc, row) => {
      acc[row.table_name] = acc[row.table_name] || [];
      acc[row.table_name].push({
        Columna: row.column_name,
        "Tipo de Dato": row.data_type,
        "Nulable?": row.is_nullable,
        Default: row.column_default,
        "Clave Foránea": row.foreign_key_info || "N/A",
      });
      return acc;
    }, {});

    console.log("\n--- 🔬 INFORME DE RADIOGRAFÍA DEL ESQUEMA 'public' ---");
    for (const tableName in tables) {
      console.log(`\n📄 Tabla: ${tableName}`);
      console.table(tables[tableName]);
    }
    console.log("--------------------------------------------------");
  } catch (e) {
    console.error(
      `\n❌ [FALLO] El diagnóstico del esquema ha fallado: ${e.message}`
    );
    process.exit(1);
  }

  console.log(
    "\n✅ [ÉXITO] La radiografía del esquema ha finalizado con éxito."
  );
}

diagnoseSchema();
