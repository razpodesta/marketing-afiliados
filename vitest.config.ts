/**
 * @file vitest.config.ts
 * @description Configuración principal para el corredor de pruebas Vitest.
 * @author L.I.A Legacy & Validator
 * @version 3.1.0 (Type-Safe & CI/CD Optimized)
 */
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv, type ConfigEnv } from "vite";
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
        "**/middleware.ts",
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
