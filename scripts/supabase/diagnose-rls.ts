// Ruta: scripts/supabase/diagnose-rls.ts (CORREGIDO)
/**
 * @file diagnose-rls.ts
 * @description Aparato de Auditoría de Seguridad a Nivel de Fila (RLS).
 * @author L.I.A Legacy
 * @version 1.0.2 (Type Safety & Execution Fix)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
} = process.env;

// CORRECCIÓN: Se define un tipo explícito para la estructura del acumulador.
// Describe un objeto donde cada clave es un nombre de tabla (string) y el valor
// es un array de objetos de política.
type PoliciesByTable = Record<
  string,
  {
    Política: string;
    Comando: string;
    Roles: string;
    Definición: string;
  }[]
>;

async function diagnoseRLS() {
  console.log("🚀 [AUDITORÍA DE SEGURIDAD RLS V1.0] Iniciando...");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ ERROR CATASTRÓFICO: Las variables de entorno de Supabase no están definidas."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    console.log(
      "🔬 Fase 1: Verificando estado de RLS en todas las tablas del esquema 'public'..."
    );
    const { data: tablesData, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name, row_level_security")
      .eq("table_schema", "public");

    if (tablesError)
      throw new Error(
        `No se pudo consultar el esquema de tablas: ${tablesError.message}`
      );

    console.log("\n--- 📊 INFORME DE ESTADO DE RLS ---");
    console.table(tablesData, ["table_name", "row_level_security"]);

    const enabledTables = tablesData
      .filter((table) => table.row_level_security === "ENABLED")
      .map((table) => table.table_name);

    if (enabledTables.length > 0) {
      console.log(
        "\n🔬 Fase 2: Detallando políticas para tablas con RLS habilitado..."
      );

      const { data: policiesData, error: policiesError } = await supabase
        .from("pg_policy")
        .select("schemaname, tablename, policyname, cmd, roles, definition")
        .in("tablename", enabledTables);

      if (policiesError)
        throw new Error(
          `No se pudieron consultar las políticas de RLS: ${policiesError.message}`
        );

      if (policiesData && policiesData.length > 0) {
        console.log(
          "\n--- 🛡️ INFORME DE POLÍTICAS DE SEGURIDAD DETALLADAS ---"
        );

        // CORRECCIÓN: Se tipa explícitamente el acumulador 'acc' y el valor inicial.
        const policiesByTable = policiesData.reduce(
          (acc: PoliciesByTable, policy) => {
            acc[policy.tablename] = acc[policy.tablename] || [];
            acc[policy.tablename].push({
              Política: policy.policyname,
              Comando: policy.cmd,
              Roles: policy.roles.join(", "),
              Definición: policy.definition,
            });
            return acc;
          },
          {} as PoliciesByTable
        );

        for (const tableName in policiesByTable) {
          console.log(`\n📄 Políticas para la tabla: ${tableName}`);
          console.table(policiesByTable[tableName]);
        }
      } else {
        console.warn(
          "\n🟡 ADVERTENCIA: Hay tablas con RLS habilitado pero sin políticas definidas."
        );
      }
    }
    console.log("--------------------------------------------------");
  } catch (e: any) {
    console.error(`\n❌ [FALLO] La auditoría de RLS ha fallado: ${e.message}`);
    process.exit(1);
  }

  console.log("\n✅ [ÉXITO] La auditoría de seguridad RLS ha finalizado.");
}

// CORRECCIÓN: Se llama a la función correcta.
diagnoseRLS();
