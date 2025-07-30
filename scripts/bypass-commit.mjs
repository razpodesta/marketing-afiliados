// Ruta: scripts/bypass-commit.mjs
/**
 * @file bypass-commit.mjs
 * @description Protocolo de Bypass para commits de trabajo en progreso (WIP).
 *              Añade todos los cambios, realiza un commit con el mensaje proporcionado
 *              y omite los hooks de pre-commit. Este script está diseñado para ser
 *              resiliente y manejar estados de repositorio sin cambios.
 * @author L.I.A Legacy
 * @version 2.0.0 (Resilient & User-Friendly)
 */

import chalk from "chalk";
import { execSync } from "child_process";

const log = console.log;

function executeCommand(command, description) {
  try {
    log(chalk.blue(`> ${command}`));
    execSync(command, { stdio: "inherit" });
    log(chalk.green(`✅ ${description}`));
  } catch (error) {
    log(chalk.red(`❌ Error ejecutando: "${command}"`));
    throw error; // Propagar el error para que el script aborte
  }
}

function hasChanges() {
  // `git status --porcelain` devuelve una lista de cambios.
  // Si la salida está vacía, no hay cambios.
  const status = execSync("git status --porcelain").toString().trim();
  return status.length > 0;
}

// --- Inicio del Protocolo ---
log(chalk.yellow("🚀 [PROTOCOLO DE BYPASS ACTIVADO]"));
log(chalk.gray("-----------------------------------------"));

try {
  const commitMessage = process.argv.slice(2).join(" ");
  if (!commitMessage) {
    throw new Error("No se proporcionó un mensaje para el commit.");
  }

  // 1. Añadir todos los archivos al stage
  executeCommand("git add .", "Archivos añadidos al stage.");

  // 2. VERIFICACIÓN DE ESTADO (LÓGICA RESILIENTE)
  if (!hasChanges()) {
    log(
      chalk.yellow(
        "🟡 No hay cambios para realizar el commit. El árbol de trabajo está limpio."
      )
    );
    log(chalk.gray("-----------------------------------------"));
    log(chalk.green("✅ Protocolo finalizado sin necesidad de commit."));
    process.exit(0); // Salir exitosamente
  }

  // 3. Realizar commit con --no-verify (solo si hay cambios)
  executeCommand(
    `git commit --no-verify -m "${commitMessage}"`,
    "Commit realizado con éxito."
  );

  log(chalk.gray("-----------------------------------------"));
  log(chalk.green("✅ Protocolo de Bypass completado."));
} catch (error) {
  log(chalk.red(`❌ ${error.message}`));
  log(chalk.red("❌ Falló el protocolo. Abortando."));
  process.exit(1);
}
