/**
 * @file postcss.config.cjs
 * @description Configuración de PostCSS, utilizando sintaxis CommonJS (.cjs) para
 *              máxima compatibilidad con el ecosistema de herramientas de build.
 * @author Metashark & Validator
 * @version 2.1.0 (CommonJS Syntax Correction)
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
