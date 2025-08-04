// vitest.config.unit.ts
/**
 * @file vitest.config.unit.ts
 * @description Configuración de Vitest para la suite de pruebas unitarias.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      include: ["**/tests/unit/**/*.test.ts(x)?"],
    },
  })
);
