/* Ruta: scripts/generate-routes-manifest.mjs */

import fs from "fs/promises";
import path from "path";

/**
 * @file generate-routes-manifest.mjs
 * @description Script de Node.js para analizar la estructura de directorios de la carpeta `app`
 * y generar un manifiesto JSON (`routes-manifest.json`) con todas las rutas de la aplicación.
 * Este script se ejecuta después del proceso de build para proporcionar una vista
 * dinámica de la estructura del sitio en el `dev-console`.
 *
 * @author Metashark
 * @version 1.0.0
 */

const APP_DIR = path.join(process.cwd(), "app", "[locale]");
const OUTPUT_FILE = path.join(process.cwd(), "public", "routes-manifest.json");

/**
 * @typedef {Object} RouteNode
 * @property {string} name - El nombre del segmento de la ruta.
 * @property {string} path - La ruta completa desde la raíz de la app.
 * @property {boolean} isPage - Si este nodo representa un `page.tsx`.
 * @property {RouteNode[]} children - Nodos hijos en la estructura de árbol.
 */

/**
 * Analiza recursivamente un directorio para construir un árbol de rutas.
 * @param {string} dir - El directorio a analizar.
 * @param {string} [prefix=''] - El prefijo de la ruta actual.
 * @returns {Promise<RouteNode[]>} Una promesa que resuelve a un array de nodos de ruta.
 */
async function generateRouteTree(dir, prefix = "/") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = path.join(prefix, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      const children = await generateRouteTree(fullPath, routePath);
      // Solo añade el directorio si tiene páginas hijas o es una página en sí mismo.
      if (children.length > 0) {
        routes.push({
          name: entry.name,
          path: routePath,
          isPage: false,
          children,
        });
      }
    } else if (entry.name === "page.tsx") {
      // Si encontramos un page.tsx, marcamos el nodo padre como una página.
      // Buscamos si ya existe una entrada para este directorio.
      const parentDirName = path.basename(path.dirname(fullPath));
      const parentRoutePath = prefix.replace(/\\/g, "/");

      let parentNode = routes.find((r) => r.name === parentDirName);
      if (parentNode) {
        parentNode.isPage = true;
      } else {
        // Si es un archivo de página en la raíz de la carpeta que estamos escaneando.
        // Esto es para el caso especial de `page.tsx` directamente dentro de un directorio.
        // El que crea el nodo es el bucle del directorio. Aquí solo actualizamos.
      }
    }
  }

  // Post-procesamiento para marcar correctamente las páginas
  for (const entry of entries) {
    if (entry.name === "page.tsx") {
      const parentDirName = path.basename(dir);
      let parentNode = routes.find((r) => r.name === parentDirName);
      if (parentNode) parentNode.isPage = true;
    }
  }

  return routes.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  console.log("Generating routes manifest...");
  try {
    const routeTree = await generateRouteTree(APP_DIR);

    // Simplificamos la estructura inicial para que no incluya `[locale]`
    const finalTree = {
      name: "/",
      path: "/",
      isPage: routeTree.some((e) => e.name === "page.tsx"), // check root page
      children: routeTree.filter((e) => e.name !== "page.tsx"),
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalTree, null, 2));
    console.log(`✅ Routes manifest generated at ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Error generating routes manifest:", error);
  }
}

main();
/* Ruta: scripts/generate-routes-manifest.mjs */
