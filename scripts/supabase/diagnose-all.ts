// scripts/supabase/diagnose-all.ts

//Uso: pnpm run tsx scripts/supabase/diagnose-all.ts

/**
 * @file diagnose-all.ts
 * @description Aparato de Diagnóstico Integral y Autónomo. Ejecuta todas las
 *              comprobaciones de infraestructura contra el entorno definido en
 *              .env.local, ya sea local o remoto.
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
    // La función 'hello_world' puede no existir, una consulta simple es más robusta.
    const { error } = await supabase.from("workspaces").select("id").limit(1);
    const latency = Math.round(performance.now() - startTime);
    // Un error de RLS (Row Level Security) es un ÉXITO de conexión.
    if (
      error &&
      !error.message.includes("violates row-level security policy")
    ) {
      throw error;
    }
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
      Estado: config.MAILER_AUTOCONFIRM
        ? "🟡 Advertencia (Deshabilitar en Producción)"
        : "✅ OK",
    },
  });
  const providers = Object.entries(config.EXTERNAL_PROVIDERS)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k);
  console.log(
    `   - Proveedores OAuth habilitados: ${providers.join(", ") || "Ninguno"}`
  );
}

// ======== ORQUESTADOR PRINCIPAL ========

async function main() {
  console.log(
    " M E T A S H A R K  -  S Y S T E M   H E A L T H   A U D I T  (REMOTE)"
  );
  let hasFailed = false;

  const checks = [
    { name: "Conectividad de API Remota", fn: diagnoseConnectivity },
    { name: "Configuración de Plataforma Remota", fn: diagnosePlatformConfig },
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
  console.log("🏁 AUDITORÍA REMOTA COMPLETADA 🏁");
  console.log("=".repeat(60));

  if (hasFailed) {
    console.error(
      "\n❌ INFORME FINAL: Se han detectado problemas críticos de conexión/configuración."
    );
    process.exit(1);
  } else {
    console.log(
      "\n✅ INFORME FINAL: Todas las verificaciones de conexión remota han finalizado con éxito."
    );
  }
}

main();
// scripts/supabase/diagnose-all.ts
