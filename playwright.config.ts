// playwright.config.ts
/**
 * @file playwright.config.ts
 * @description Configuración canónica para la suite de pruebas E2E.
 *              Ha sido refactorizada para usar sintaxis de Módulos ES en su totalidad,
 *              resolviendo el error `require is not defined`.
 * @author L.I.A Legacy
 * @version 3.0.0 (Full ES Module Syntax)
 */
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv"; // --- INICIO DE CORRECCIÓN ---
import path from "path";
import { fileURLToPath } from "url";

// Derivación de __dirname para Módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno usando la sintaxis de importación
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
// --- FIN DE CORRECCIÓN ---

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
// playwright.config.ts
