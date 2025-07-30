// Ruta: scripts/supabase/diagnose-all.ts
/**
 * @file diagnose-all.ts
 * @description Aparato de Diagnóstico Integral y Autónomo. Ejecuta todas las
 *              comprobaciones de infraestructura en un único script para máxima
 *              robustez y para evitar problemas de resolución de módulos.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 3.0.0 (Monolithic, Real & Self-Contained)
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

// Carga las variables de entorno una sola vez.
dotenv.config({ path: ".env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_ACCESS_TOKEN,
} = process.env;

// ======== HELPERS GLOBALES ========
const printSection = (title: string) => {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 DIAGNÓSTICO: ${title.toUpperCase()}`);
  console.log("=".repeat(60));
};

// ======== LÓGICA DE DIAGNÓSTICO CONSOLIDADA ========

async function diagnoseConnectivity() {
  if (
    !NEXT_PUBLIC_SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Variables de entorno de Supabase (URL/Keys) no definidas."
    );
  }
  const supabaseService = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );
  await testConnection(supabaseService, "Service Role (Backend)");
  const supabaseAnon = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  await testConnection(supabaseAnon, "Anonymous Role (Frontend)");
}

async function testConnection(supabase: SupabaseClient, roleName: string) {
  const startTime = performance.now();
  try {
    const { error } = await supabase.rpc("hello_world");
    const latency = Math.round(performance.now() - startTime);
    if (error) throw error;
    console.log(
      `   - ✅ [ÉXITO] Conexión para ${roleName} exitosa. Latencia: ${latency}ms`
    );
  } catch (error: any) {
    console.error(
      `   - ❌ [FALLO] Conexión para ${roleName}: ${error.message}`
    );
    throw error;
  }
}

type SupabaseAuthConfig = {
  SITE_URL: string;
  MAILER_AUTOCONFIRM: boolean;
  EXTERNAL_PROVIDERS: Record<string, { enabled: boolean }>;
};
async function diagnosePlatformConfig() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_ACCESS_TOKEN) {
    throw new Error(
      "Variables de entorno de Supabase (URL/Access Token) no definidas."
    );
  }
  const projectIdMatch = NEXT_PUBLIC_SUPABASE_URL.match(/https?:\/\/([^.]+)/);
  if (!projectIdMatch?.[1])
    throw new Error("No se pudo extraer el ID del proyecto desde la URL.");
  const projectId = projectIdMatch[1];

  console.log(`🔬 Auditando proyecto de Supabase ID: ${projectId}`);
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectId}/auth/config`,
    {
      headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}` },
    }
  );

  if (!response.ok)
    throw new Error(
      `Fallo en la llamada a la Management API (Status: ${response.status})`
    );
  const config = (await response.json()) as SupabaseAuthConfig;

  console.log("--- 📝 INFORME DE CONFIGURACIÓN DE AUTENTICACIÓN ---");
  console.table({
    SITE_URL: {
      Value: config.SITE_URL,
      Estado: config.SITE_URL ? "✅ OK" : "❌ CRÍTICO",
    },
    MAILER_AUTOCONFIRM: {
      Value: config.MAILER_AUTOCONFIRM,
      Estado: config.MAILER_AUTOCONFIRM ? "🟡 Advertencia" : "✅ OK",
    },
  });
  const providers = Object.entries(config.EXTERNAL_PROVIDERS)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k);
  console.log(
    `Proveedores OAuth habilitados: ${providers.join(", ") || "Ninguno"}`
  );
}

async function diagnoseDbSchema() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    throw new Error(
      "Variables de entorno de Supabase (URL/Service Key) no definidas."
    );
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabase.rpc("get_schema_details");
  if (error) {
    if (error.code === "42883")
      console.error(
        "   - ❌ ERROR DE DEPENDENCIA: La función RPC 'get_schema_details' no se encontró."
      );
    throw error;
  }
  const tables = data.reduce((acc: any, row: any) => {
    (acc[row.table_name] = acc[row.table_name] || []).push({
      Columna: row.column_name,
      Tipo: row.data_type,
      "Nulable?": row.is_nullable,
      FK: row.foreign_key_info || "N/A",
    });
    return acc;
  }, {});
  console.log("--- 🔬 INFORME DE RADIOGRAFÍA DEL ESQUEMA 'public' ---");
  for (const tableName in tables) {
    console.log(`\n📄 Tabla: ${tableName}`);
    console.table(tables[tableName]);
  }
}

async function diagnoseRls() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    throw new Error(
      "Variables de entorno de Supabase (URL/Service Key) no definidas."
    );
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name, row_level_security")
    .eq("table_schema", "public");
  if (tablesError) throw tablesError;
  console.log("\n--- 📊 INFORME DE ESTADO DE RLS ---");
  console.table(tables, ["table_name", "row_level_security"]);
}

async function diagnoseDataIntegrity() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    throw new Error(
      "Variables de entorno de Supabase (URL/Service Key) no definidas."
    );
  const supabase = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );
  const checks = [
    { name: "Usuarios sin Perfil", rpc: "users_without_profiles_check" },
    {
      name: "Workspaces sin Propietario",
      rpc: "workspaces_without_owners_check",
    },
  ];
  let hasFailures = false;
  for (const check of checks) {
    const { data, error } = await supabase.rpc(check.rpc);
    if (error) {
      if (error.code === "42883")
        console.error(
          `   - ❌ ERROR DE DEPENDENCIA: La función RPC '${check.rpc}' no se encontró.`
        );
      else console.error(`   - ❌ ERROR RPC: ${error.message}`);
      hasFailures = true;
    } else if (data > 0) {
      console.error(`   - ❌ FALLÓ: Se encontraron ${data} ${check.name}.`);
      hasFailures = true;
    } else {
      console.log(`   - ✅ PASÓ: No se encontraron ${check.name}.`);
    }
  }
  if (hasFailures)
    throw new Error("La auditoría de integridad de datos detectó problemas.");
}

// ======== ORQUESTADOR PRINCIPAL ========

async function main() {
  console.log(" M E T A S H A R K  -  S Y S T E M   H E A L T H   A U D I T ");
  let hasFailed = false;

  const checks = [
    { name: "Conectividad de API", fn: diagnoseConnectivity },
    { name: "Configuración de Plataforma", fn: diagnosePlatformConfig },
    { name: "Esquema de Base de Datos", fn: diagnoseDbSchema },
    { name: "Políticas de Seguridad (RLS)", fn: diagnoseRls },
    { name: "Integridad de Datos Relacionales", fn: diagnoseDataIntegrity },
  ];

  for (const check of checks) {
    printSection(check.name);
    try {
      await check.fn();
    } catch (error: any) {
      hasFailed = true;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🏁 AUDITORÍA DE SALUD DEL SISTEMA COMPLETADA 🏁");
  console.log("=".repeat(60));

  if (hasFailed) {
    console.error("\n❌ INFORME FINAL: Se han detectado problemas críticos.");
    process.exit(1);
  } else {
    console.log(
      "\n✅ INFORME FINAL: Todos los diagnósticos han finalizado con éxito."
    );
  }
}

main();
// Ruta: scripts/supabase/diagnose-all.ts
