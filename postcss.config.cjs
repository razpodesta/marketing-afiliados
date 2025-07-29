// Ruta: postcss.config.cjs
/**
 * @file postcss.config.cjs
 * @description Configuración de PostCSS, utilizando sintaxis CommonJS (.cjs) para
 *              máxima compatibilidad con el ecosistema de herramientas de build.
 *              Este aparato actúa como un puente, procesando el CSS con plugins
 *              como Tailwind CSS y Autoprefixer antes de que sea servido al navegador.
 * @author Metashark & Validator (Revisado por L.I.A Legacy)
 * @version 2.1.0 (CommonJS Syntax Correction)
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
// Ruta: postcss.config.cjs
