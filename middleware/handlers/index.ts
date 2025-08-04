// middleware/handlers/index.ts
/**
 * @file index.ts
 * @description Barrel file para exportar todos los manejadores del middleware
 *              de forma atómica y organizada. Ha sido refactorizado para incluir
 *              los manejadores de telemetría y fallback de idioma, resolviendo
 *              errores de importación en el orquestador del middleware.
 * @author L.I.A Legacy
 * @version 2.1.0 (Full Handler Manifest)
 * @see {@link file://../../tests/middleware/tests/index.test.ts} Para el arnés de pruebas correspondiente.
 */
export * from "./auth";
export * from "./i18n";
export * from "./locale-fallback"; // <-- RESTAURADO
export * from "./maintenance";
export * from "./multitenancy";
export * from "./redirects";
export * from "./telemetry"; // <-- RESTAURADO

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Generación Automática**: ((Vigente)) Crear un script que analice este directorio y genere este archivo barril automáticamente para prevenir futuras omisiones y desincronizaciones manuales.
 * 2. **Validación de Exportaciones**: ((Vigente)) El script de generación automática podría incluir una validación para asegurar que cada módulo exporta una función con un nombre esperado (ej. `handle...`), manteniendo la consistencia del patrón.
 *
 * @subsection Mejoras Implementadas
 * 1. **Manifiesto Completo**: ((Implementada)) Se han añadido las exportaciones para `locale-fallback` y `telemetry`, restaurando la integridad del pipeline de middleware.
 */
// middleware/handlers/index.ts
