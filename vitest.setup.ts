/**
 * @file vitest.setup.ts
 * @description Archivo de configuración global para Vitest.
 *              Su única misión es importar y extender las aserciones de Vitest
 *              con los "matchers" de @testing-library/jest-dom, habilitando
 *              aserciones del DOM como `toBeInTheDocument()`.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import "@testing-library/jest-dom";
