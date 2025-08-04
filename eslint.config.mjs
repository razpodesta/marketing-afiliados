// eslint.config.mjs (Refactorizado)
/**
 * @file Manifiesto de configuración de ESLint ("Flat Config").
 * @description Única fuente de verdad para el análisis estático. Ha sido
 *              hiper-optimizado para incluir reglas específicas para Vitest y
 *              una configuración explícita de TypeScript, garantizando la máxima
 *              calidad en todo el stack del proyecto.
 * @author L.I.A Legacy & Validator
 * @version 5.0.0 (Vitest & Explicit TS Integration)
 */
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "coverage/**", "dist/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...typescriptPlugin.configs["eslint-recommended"].rules,
      ...typescriptPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // --- INICIO DE HIPER-OPTIMIZACIÓN ---
  {
    files: ["**/tests/**/*.{ts,tsx}"],
    plugins: { vitest: vitestPlugin },
    rules: vitestPlugin.configs.recommended.rules,
    languageOptions: {
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
  },
  // --- FIN DE HIPER-OPTIMIZACIÓN ---
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
