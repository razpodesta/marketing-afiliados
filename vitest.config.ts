// vitest.config.ts (ESTADO FINAL)
/**
 * @file vitest.config.ts
 * @description Configuración de Vitest ÚNICA y CANÓNICA para todo el proyecto.
 *              Soporta la arquitectura de pruebas de élite, separando las pruebas
 *              unitarias y de integración, y está lista para escalar.
 * @author L.I.A. Legacy
 * @version 35.0.0 (Elite Test Architecture)
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "vitest.setup.ts",
    include: ["tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        // Archivos de configuración y tipos
        "**/*.config.{js,ts,mjs}",
        "**/*.d.ts",
        ".*rc.{js,json}",
        "components.json",
        // Directorios de build y dependencias
        ".next/**",
        "coverage/**",
        "dist/**",
        "node_modules/**",
        // Activos públicos y Mocks
        "public/**",
        "**/mocks/**",
        "**/lib/dev/**",
        // Componentes de UI puros (scaffolding) y plantillas
        "**/components/ui/**",
        "**/templates/**",
        // Tipos de base de datos generados y scripts
        "**/types/database/**",
        "**/scripts/**",
        // Configuración de Sentry
        "sentry.*.config.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    exclude: ["node_modules/**", "dist/**", "tests/e2e/**"],
  },
});
