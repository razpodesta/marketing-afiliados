// eslint.config.mjs
/**
 * @file Manifiesto de configuración de ESLint ("Flat Config").
 * @description Única fuente de verdad para el análisis estático. Ha sido
 *              blindado para integrar `eslint-plugin-sentry` y garantizar
 *              una configuración explícita y libre de conflictos.
 * @author L.I.A Legacy & Validator
 * @version 7.0.0 (Elite Import Sorting & Dependency Alignment)
 */
import { FlatCompat } from "@eslint/eslintrc";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import sentryPlugin from "eslint-plugin-sentry";
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
  // 1. Archivos ignorados
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "sentry.*.config.ts",
    ],
  },

  // 2. Configuraciones base
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },

  // 3. Reglas de ordenación de importaciones (MEJORADO)
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports.
            ["^\\u0000"],
            // React y Next.js primero.
            ["^react", "^next"],
            // Paquetes externos.
            ["^@?\\w"],
            // Alias de importación internos.
            ["^@/"],
            // Imports relativos del padre.
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Otros imports relativos.
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Imports de estilos.
            ["^.+\\.?(css)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },

  // 4. Configuración específica para TypeScript y React
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

  // 5. Configuración específica para Sentry
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: { sentry: sentryPlugin },
    rules: {
      ...sentryPlugin.configs.recommended.rules,
      ...sentryPlugin.configs["nextjs"].rules,
    },
  },

  // 6. Configuración para pruebas con Vitest
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

  // 7. Entornos globales
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // 8. Prettier (DEBE SER EL ÚLTIMO)
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Orden de Importación de Élite**: ((Implementada)) Se ha configurado `simple-import-sort` con grupos explícitos para forzar un ordenamiento lógico y consistente en todo el proyecto, mejorando la legibilidad.
 * 2. **Alineación de Dependencias**: ((Implementada)) Se ha identificado y resuelto la inconsistencia de la dependencia faltante `eslint-plugin-vitest`.
 *
 * @subsection Melhorias Futuras
 * 1. **Reglas de Linting Específicas del Proyecto**: ((Vigente)) Considerar añadir reglas personalizadas de ESLint para forzar convenciones específicas del proyecto, como una estructura de nomenclatura para Server Actions o componentes.
 */
// eslint.config.mjs
