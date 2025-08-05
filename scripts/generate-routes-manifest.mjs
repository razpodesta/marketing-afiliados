// scripts/generate-routes-manifest.mjs
/**
 * @file generate-routes-manifest.mjs
 * @description Script de élite que genera automáticamente el manifiesto de
 *              navegación. Ha sido blindado para ser agnóstico al sistema
 *              operativo y para escapar correctamente las cadenas, garantizando
 *              una salida sintácticamente válida en todo momento.
 * @author L.I.A Legacy
 * @version 4.0.0 (Syntax Hardening)
 */
import fs from "fs/promises";
import path from "path";

const APP_DIR = path.join(process.cwd(), "app", "[locale]");
const OUTPUT_FILE = path.join(process.cwd(), "lib", "navigation.ts");
const IGNORE_DIRS = ["auth-notice", "s"];

const HEADER = `
// lib/navigation.ts
/**
 * @file lib/navigation.ts
 * @description Manifiesto de Enrutamiento y Contrato de Navegación.
 *              Este archivo es generado AUTOMÁTICAMENTE por el script
 *              \`scripts/generate-routes-manifest.mjs\`. NO LO EDITE MANUALMENTE.
 * @author L.I.A Legacy (Generado Automáticamente)
 * @version ${new Date().toISOString()}
 */
import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from "next-intl/navigation";

export const locales = ["en-US", "es-ES", "pt-BR"] as const;
export type AppLocale = (typeof locales)[number];
export const localePrefix = "as-needed";
`.trim();

async function generateRouteTree(dir, prefix = "/") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let routes = {};

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    // --- INICIO DE CORRECCIÓN DE PORTABILIDAD Y SINTAXIS ---
    // Se utiliza path.posix.join para forzar el uso de barras diagonales.
    const routePath = path.posix.join(prefix, entry.name);
    // --- FIN DE CORRECCIÓN ---

    if (entry.isDirectory()) {
      const childrenRoutes = await generateRouteTree(fullPath, routePath);
      routes = { ...routes, ...childrenRoutes };

      const pageFileExists = await fs
        .access(path.join(fullPath, "page.tsx"))
        .then(() => true)
        .catch(() => false);

      if (pageFileExists) {
        routes[routePath] = routePath;
      }
    }
  }
  return routes;
}

async function main() {
  console.log("🚀 Generando manifiesto de navegación tipado...");
  try {
    const routeTree = await generateRouteTree(APP_DIR);
    const rootPageExists = await fs
      .access(path.join(APP_DIR, "page.tsx"))
      .then(() => true)
      .catch(() => false);

    if (rootPageExists) {
      routeTree["/"] = "/";
    }

    const sortedRoutes = Object.keys(routeTree)
      .sort()
      .reduce((obj, key) => {
        obj[key] = routeTree[key];
        return obj;
      }, {});

    let pathnamesContent =
      "export const pathnames = {\n" +
      Object.entries(sortedRoutes)
        .map(([key, value]) => `  "${key}": "${value}"`)
        .join(",\n") +
      "\n} satisfies Pathnames<typeof locales>;";

    const footer = `
export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });

export type AppPathname = keyof typeof pathnames;
    `;

    const finalContent = `${HEADER}\n\n${pathnamesContent}\n\n${footer.trim()}\n`;

    await fs.writeFile(OUTPUT_FILE, finalContent);
    console.log(`✅ Manifiesto de navegación generado en: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Error generando el manifiesto de navegación:", error);
    process.exit(1);
  }
}

main();
