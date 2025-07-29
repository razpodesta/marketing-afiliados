// Ruta: eslint.config.mjs
/**
 * @file Manifiesto de configuración de ESLint ("Flat Config").
 * @description Única fuente de verdad para el análisis estático de código, compatible con ESLint v9+.
 *              Este aparato es el "código de conducta" del código fuente, garantizando
 *              calidad, consistencia, accesibilidad y la prevención de errores comunes.
 *              Se ha actualizado para ignorar los artefactos de compilación y añadir
 *              reglas para los hooks de React.
 * @author L.I.A Legacy & Validator
 * @version 4.1.0 (Build Artifact Ignore & React Hooks Rules)
 */
import { FlatCompat } from "@eslint/eslintrc";
// Plugins
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // CORRECCIÓN CRÍTICA: Ignorar directorios de compilación y configuración.
  // Esto resuelve la mayoría de los errores reportados y acelera el proceso de linting.
  {
    ignores: [".next/**", "coverage/**", "dist/**"],
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
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
// Ruta: eslint.config.mjs
