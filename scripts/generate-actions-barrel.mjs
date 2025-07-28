// Ruta: scripts/generate-actions-barrel.mjs
/**
 * @file generate-actions-barrel.mjs
 * @description Script de Node.js para generar automáticamente el barrel file
 *              `app/actions/index.ts` con exportaciones por namespace.
 * @refactor
 * REFACTORIZACIÓN CRÍTICA DE BUILD: Se ha modificado la lógica de generación de
 * rutas para que elimine la extensión '.ts' de las exportaciones. Esto resuelve
 * el conflicto con la configuración `"moduleResolution": "bundler"` en tsconfig.json
 * y elimina los errores de TypeScript.
 *
 * @author Metashark
 * @version 2.0.0 (TypeScript Module Resolution Fix)
 */
import fs from "fs/promises";
import path from "path";

const ACTIONS_DIR = path.join(process.cwd(), "app", "actions");
const OUTPUT_FILE = path.join(ACTIONS_DIR, "index.ts");
const IGNORE_FILES = ["index.ts", "schemas", "_helpers"]; // Ignoramos también los helpers

const HEADER = `
// Ruta: app/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Este archivo exporta todas las Server Actions del proyecto, agrupadas
 *              por namespaces de dominio para una máxima organización y claridad.
 *
 * @version 2.0.0 (Namespaced Exports & Auto-Generation)
 * @author Metashark
 *
 * @important Este archivo es generado automáticamente por el script:
 *            \`scripts/generate-actions-barrel.mjs\`.
 *            No lo edite manualmente.
 *
 * @example
 * // Antes: import { createSiteAction } from "@/app/actions/sites.actions";
 * // Ahora: import { sites } from "@/app/actions";
 * // Uso:   sites.createSiteAction(...)
 */
`.trim();

async function main() {
  console.log("🚀 Generando manifiesto de Server Actions...");
  try {
    const entries = await fs.readdir(ACTIONS_DIR, { withFileTypes: true });
    const actionFiles = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".actions.ts") &&
          !IGNORE_FILES.some((ignore) => entry.name.startsWith(ignore))
      )
      .map((entry) => entry.name);

    const exports = actionFiles
      .map((fileName) => {
        const namespace = fileName.replace(".actions.ts", "");
        // CORRECCIÓN: Eliminamos la extensión .ts de la ruta de importación
        const modulePath = `./${fileName.replace(/\.ts$/, "")}`;
        return `export * as ${namespace} from "${modulePath}";`;
      })
      .join("\n");

    const content = `${HEADER}\n\n${exports}\n`;

    await fs.writeFile(OUTPUT_FILE, content);
    console.log(
      `✅ Manifiesto de acciones generado exitosamente en ${OUTPUT_FILE}`
    );
  } catch (error) {
    console.error("❌ Error generando el manifiesto de acciones:", error);
    process.exit(1);
  }
}

main();
