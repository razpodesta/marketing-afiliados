// vitest.config.ts
/**
 * @file vitest.config.ts
 * @description Configuración de Vitest BASE y canónica.
 * @author L.I.A. Legacy
 * @version 28.0.0 (Holistic Vision Restoration)
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
        "**/templates/**",
        "**/types/database/**",
        "**/tests/**",
      ],
    },
    exclude: [
      "node_modules/**",
      "dist/**",
      ".idea/**",
      ".git/**",
      "coverage/**",
    ],
  },
});
