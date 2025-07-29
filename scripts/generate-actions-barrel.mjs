// scripts/generate-actions-barrel.mjs
/**
 * @file generate-actions-barrel.mjs
 * @description Script de Node.js para generar automáticamente el barrel file
 *              `lib/actions/index.ts` con exportaciones por namespace.
 * @refactor
 * REFACTORIZACIÓN ARQUITECTÓNICA: Se ha actualizado la ruta de origen para que
 * apunte a la nueva ubicación canónica `lib/actions`, alineando el andamiaje
 * de herramientas con la estructura granular del proyecto.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Architectural Alignment)
 */
import fs from "fs/promises";
import path from "path";

const ACTIONS_DIR = path.join(process.cwd(), "lib", "actions");
const OUTPUT_FILE = path.join(ACTIONS_DIR, "index.ts");
const IGNORE_FILES = ["index.ts", "schemas", "_helpers"];

const HEADER = `
// Ruta: lib/actions/index.ts
/**
 * @file index.ts
 * @description Manifiesto de la API de Acciones del Servidor (Barrel File).
 *              Este archivo exporta todas las Server Actions del proyecto, agrupadas
 *              por namespaces de dominio para una máxima organización y claridad.
 *
 * @version 3.0.0 (Architectural Alignment & Auto-Generation)
 * @author Metashark
 *
 * @important Este archivo es generado automáticamente por el script:
 *            \`scripts/generate-actions-barrel.mjs\`.
 *            No lo edite manualmente.
 *
 * @example
 * // Antes: import { createSiteAction } from "@/lib/actions/sites.actions";
 * // Ahora: import { sites } from "@/lib/actions";
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

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Script Configurable: En lugar de tener rutas codificadas, el script podría aceptar argumentos de línea de comandos (ej. `--source=lib/actions --output=lib/actions/index.ts`), haciéndolo más flexible y reutilizable para generar otros archivos barril en el futuro.
 * 2. Manejo de Directorio Vacío: Si el directorio `lib/actions` se encuentra pero está vacío (sin archivos `.actions.ts`), el script podría generar un archivo `index.ts` con un comentario explicativo en lugar de un archivo vacío, mejorando la claridad.
 * 3. Integración con Watch Mode: Para una experiencia de desarrollo superior, este script podría ser ejecutado en modo "watch" durante `pnpm dev` (usando una librería como `chokidar`). Esto regeneraría automáticamente el archivo barril cada vez que un nuevo archivo de acción sea añadido o eliminado, eliminando la necesidad de reiniciar el servidor de desarrollo.
 */
