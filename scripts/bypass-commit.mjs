// Ruta: scripts/bypass-commit.mjs

// USO:
// pnpm run bypass "WIP: Refactorizando la capa de datos"

/**
 * @file bypass-commit.mjs
 * @description (PROTOCOLO DE CONTINGENCIA - WINDOWS CMD COMPATIBLE)
 *              Script de Node.js para ejecutar un flujo completo de commit y push
 *              omitiendo todos los hooks de Husky. Esta herramienta es para uso
 *              en emergencias o para commits de trabajo en progreso (WIP).
 *
 * @usage
 *   pnpm run bypass "Tu mensaje de commit aquí"
 *
 * @author L.I.A Legacy & RaZ Podestá
 * @version 2.0.0
 */
import { execSync } from "child_process";

// Helper para ejecutar comandos de forma síncrona y mostrar su salida.
const runCommand = (command) => {
  try {
    console.log(`\n> ${command}`);
    const output = execSync(command, { stdio: "inherit" });
    return { success: true, output };
  } catch (error) {
    console.error(`\n❌ Error ejecutando: "${command}"`);
    // El error ya se muestra en la consola gracias a stdio: 'inherit'
    return { success: false, error };
  }
};

async function main() {
  console.log("🚀 [PROTOCOLO DE BYPASS ACTIVADO]");
  console.log("-----------------------------------------");

  // Obtener el mensaje de commit de los argumentos de la línea de comandos
  const commitMessage = process.argv[2];

  if (!commitMessage) {
    console.error("❌ ERROR: Se requiere un mensaje de commit como argumento.");
    console.info('   Uso: pnpm run bypass "Tu mensaje de commit"');
    process.exit(1);
  }

  // --- PASO 1: AÑADIR ARCHIVOS ---
  console.log("1. Añadiendo todos los archivos al stage (git add .)...");
  if (!runCommand("git add .").success) {
    console.error("❌ Falló al añadir archivos. Abortando.");
    process.exit(1);
  }
  console.log("✅ Archivos añadidos.");

  // --- PASO 2: COMMIT SIN VERIFICACIÓN ---
  console.log("2. Realizando commit con --no-verify...");
  const commitCommand = `git commit --no-verify -m "${commitMessage}"`;
  if (!runCommand(commitCommand).success) {
    console.error("❌ Falló el commit. Abortando.");
    process.exit(1);
  }
  console.log("✅ Commit creado exitosamente.");

  // --- PASO 3: PUSH SIN VERIFICACIÓN ---
  console.log("3. Realizando push con --no-verify...");
  if (!runCommand("git push --no-verify").success) {
    console.error("❌ Falló el push. Revisa la salida de git.");
    process.exit(1);
  }
  console.log("✅ Push completado exitosamente.");

  console.log("-----------------------------------------");
  console.log("✅ [PROTOCOLO DE BYPASS COMPLETADO]");
}

main();
// Ruta: scripts/bypass-commit.mjs
