// scripts/test-and-commit.mjs
/**
 * @file test-and-commit.mjs
 * @description Protocolo de Checkpoint Automatizado. Ejecuta la suite de pruebas
 *              completa en modo CI y, si tiene éxito, crea un commit.
 * @author L.I.A Legacy
 * @version 2.0.0 (CI-Aware Execution)
 */
import chalk from "chalk";
import { exec, execSync } from "child_process";

// ... (El resto del script no cambia, pero se re-entrega por completitud)
const log = console.log;

function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(chalk.blue(`> ${command}`));
    const childProcess = exec(command);
    childProcess.stdout.on("data", (data) => log(data.toString()));
    childProcess.stderr.on("data", (data) =>
      log(chalk.yellow(data.toString()))
    );
    childProcess.on("close", (code) => {
      if (code === 0) {
        log(chalk.green(`✅ ${description}`));
        resolve();
      } else {
        log(chalk.red(`❌ ${description}`));
        reject(new Error(`El comando falló con código ${code}`));
      }
    });
  });
}

function hasChanges() {
  return execSync("git status --porcelain").toString().trim().length > 0;
}

async function main() {
  log(chalk.cyan("🚀 [PROTOCOLO CHECKPOINT & CONTINUE ACTIVADO]"));
  log(chalk.gray("--------------------------------------------------"));
  try {
    // CORRECCIÓN: Se ejecuta el script `test:ci` que ahora usa la config base.
    await executeCommand(
      "pnpm test:ci",
      "Ejecución de la suite de pruebas completa con config base."
    );
    log(
      chalk.green("\n🎉 ¡Todas las pruebas pasaron! Procediendo al checkpoint.")
    );
    if (hasChanges()) {
      await executeCommand("git add .", "Archivos añadidos al stage.");
      const commitMessage = `chore(test): Checkpoint - Suite de pruebas superada en ${new Date().toISOString()}`;
      await executeCommand(
        `git commit -m "${commitMessage}"`,
        "Checkpoint creado con éxito."
      );
    } else {
      log(chalk.yellow("🟡 No hay nuevos cambios para confirmar."));
    }
    log(chalk.gray("--------------------------------------------------"));
    log(chalk.cyan("✅ Protocolo finalizado."));
    process.exit(0);
  } catch (error) {
    log(chalk.red(`\n❌ La suite de pruebas falló.`));
    log(chalk.gray("--------------------------------------------------"));
    log(chalk.yellow("🟡 Abortando checkpoint. Revisa los fallos."));
    process.exit(1);
  }
}

main();
// scripts/test-and-commit.mjs
