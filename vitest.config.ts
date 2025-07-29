// Ruta: vitest.config.ts
/**
 * @file vitest.config.ts
 * @description Configuración principal para el corredor de pruebas Vitest.
 *              Este aparato construye un "simulador de vuelo" para nuestro código,
 *              creando un entorno que imita al navegador para ejecutar pruebas
 *              de forma segura y predecible.
 * @author L.I.A Legacy & Validator
 * @version 4.0.0 (CI/CD Optimized & Critical Coverage Fix)
 */
import react from "@vitejs/plugin-react";
import path from "path";
import { type ConfigEnv, defineConfig, loadEnv } from "vite";
import type { UserConfig } from "vitest/config";

const vitestConfig: UserConfig = {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // CORRECCIÓN DE FIABILIDAD: El middleware es una pieza de lógica crítica
      // y debe estar incluido en el informe de cobertura de pruebas para
      // garantizar que está siendo testeado adecuadamente.
      exclude: [
        "**/*.config.{js,ts,mjs}",
        "**/*.d.ts",
        "**/lib/dev/**",
        "**/scripts/**",
        "**/public/**",
        "**/components/ui/**",
        "**/.next/**",
        "**/coverage/**",
        "**/.*rc.{js,json}",
        // "**/middleware.ts", // <-- ELIMINADO DE LA EXCLUSIÓN
      ],
    },
  },
};

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    ...vitestConfig,
    define: Object.keys(env).reduce((prev: Record<string, string>, key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        prev[`process.env.${key}`] = JSON.stringify(env[key]);
      }
      return prev;
    }, {}),
  };
});
// Ruta: vitest.config.ts
