// scripts/generate-routes-manifest.mjs
/**
 * @file generate-routes-manifest.mjs
 * @description Script de élite que genera automáticamente el manifiesto de
 *              navegación. Ha sido blindado con una lógica de recorrido recursivo
 *              robusta que detecta correctamente las páginas anidadas.
 * @author L.I.A Legacy
 * @version 5.0.0 (Robust Recursive Traversal)
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

/**
 * @async
 * @function generateRouteTree
 * @description Recorre de forma recursiva la estructura de directorios de 'app' para
 *              construir un mapa de todas las rutas válidas que contienen un `page.tsx`.
 * @param {string} dir - El directorio actual a escanear.
 * @param {string} [prefix="/"] - El prefijo de la ruta acumulado.
 * @returns {Promise<Record<string, string>>} Un objeto que mapea las rutas canónicas.
 */
async function generateRouteTree(dir, prefix = "/") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let routes = {};

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const routePath = path.posix.join(prefix, entry.name);

    if (entry.isDirectory()) {
      const childrenRoutes = await generateRouteTree(fullPath, routePath);
      routes = { ...routes, ...childrenRoutes };
    } else if (entry.name === "page.tsx") {
      // Lógica corregida: Si encontramos una página, su ruta es el prefijo actual.
      // Para la raíz (app/[locale]/page.tsx), el prefijo será '/'.
      routes[prefix] = prefix;
    }
  }
  return routes;
}

async function main() {
  console.log("🚀 Generando manifiesto de navegación tipado...");
  try {
    const routeTree = await generateRouteTree(APP_DIR);

    // La nueva lógica de `generateRouteTree` maneja la raíz correctamente.
    // El chequeo explícito ya no es necesario si la estructura es `app/[locale]/page.tsx`.
    if (!routeTree["/"]) {
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
