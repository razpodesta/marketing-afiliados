// vitest.config.integration.ts
/**
 * @file vitest.config.integration.ts
 * @description Configuración de Vitest para la suite de pruebas de integración.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      include: ["**/tests/integration/**/*.test.ts(x)?"],
    },
  })
);
