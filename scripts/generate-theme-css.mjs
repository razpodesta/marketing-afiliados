// scripts/generate-theme-css.mjs (Refactorizado)
/**
 * @file generate-theme-css.mjs
 * @description Script para generar el archivo de variables CSS. Ha sido
 *              refactorizado para eliminar la directiva `@layer` redundante,
 *              resolviendo un error de sintaxis de Tailwind CSS.
 * @author L.I.A Legacy
 * @version 1.2.0 (Tailwind Directive Fix)
 */
import fs from "fs/promises";
import path from "path";
import { themeConfig } from "../styles/theme.ts";

const OUTPUT_PATH = path.join(process.cwd(), "app", "theme-variables.css");

function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

async function generateCss() {
  let cssContent = `/*\n * Este archivo es generado automáticamente.\n * NO LO EDITE MANUALMENTE.\n * Fuente de verdad: styles/theme.ts\n */\n\n`;

  // --- INICIO DE CORRECCIÓN ---
  // Se elimina la envoltura `@layer base { ... }`.
  // Tema Oscuro (por defecto)
  cssContent += ":root {\n";
  for (const [key, value] of Object.entries(themeConfig.dark)) {
    cssContent += `  --${toKebabCase(key)}: ${value};\n`;
  }
  cssContent += `  --radius: ${themeConfig.radius};\n`;
  cssContent += "}\n\n";

  // Tema Claro
  cssContent += ".light {\n";
  for (const [key, value] of Object.entries(themeConfig.light)) {
    cssContent += `  --${toKebabCase(key)}: ${value};\n`;
  }
  cssContent += "}\n";
  // --- FIN DE CORRECCIÓN ---

  await fs.writeFile(OUTPUT_PATH, cssContent);
  console.log(`✅ Variables de tema CSS generadas en: ${OUTPUT_PATH}`);
}

generateCss();
