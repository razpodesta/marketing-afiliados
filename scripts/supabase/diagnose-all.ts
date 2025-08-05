// scripts/supabase/diagnose-all.ts
/**
 * @file diagnose-all.ts
 * @description Herramienta de auditoría de sistema para entornos REMOTOS.
 *              Realiza una radiografía completa del esquema, RLS y lógica
 *              de la base de datos a través de una RPC segura.
 * @author L.I.A Legacy
 * @version 9.0.0 (Canonical Remote-Only Build)
 * @usage
 * pnpm diag:all --env=dev
 * pnpm diag:all --env=test
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { loadEnvironment, parseScriptArgs } from "./_utils";

const printSection = (title: string) =>
  console.log(
    `\n\n${chalk.blue("=".repeat(60))}\n${chalk.blueBright.bold(`🚀 DIAGNÓSTICO: ${title.toUpperCase()}`)}\n${chalk.blue("=".repeat(60))}`
  );

async function main() {
  const { env } = parseScriptArgs();
  loadEnvironment(env);

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      `Variables de Supabase no definidas en el archivo para el entorno '${env}'`
    );
  }

  const supabaseAdmin = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(
    chalk.cyan(
      `\n🔬 Iniciando auditoría en el entorno remoto [${chalk.yellow.bold(env.toUpperCase())}]...`
    )
  );

  printSection("Radiografía del Sistema (Esquema, RLS, Funciones)");
  const { data, error } = await supabaseAdmin.rpc("get_system_diagnostics");

  if (error) {
    throw new Error(
      `Fallo al ejecutar RPC 'get_system_diagnostics': ${error.message}`
    );
  }

  console.log(
    chalk.green("✅ RPC 'get_system_diagnostics' ejecutada con éxito.")
  );

  console.log(chalk.white("\n--- Columnas del Esquema 'public' ---"));
  console.table(data.schema_columns || []);

  console.log(chalk.white("\n--- Políticas de Seguridad (RLS) ---"));
  console.table(data.rls_policies || []);

  console.log(chalk.white("\n--- Funciones (Routines) y Triggers ---"));
  console.table(data.routines || []);
  console.table(data.triggers || []);
}

main()
  .then(() =>
    console.log(chalk.green.bold("\n\n✅ Auditoría del sistema completada."))
  )
  .catch((error) => {
    console.error(
      chalk.red.bold("\n🔥 Fallo irrecuperable en el script:"),
      error.message
    );
    process.exit(1);
  });
