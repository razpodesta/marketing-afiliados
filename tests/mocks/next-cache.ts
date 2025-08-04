// tests/mocks/next-cache.ts
/**
 * @file next-cache.ts (Nuevo Aparato)
 * @description Módulo de simulación dedicado para `next/cache`.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { vi } from "vitest";

/**
 * @description Un mock de "passthrough" para `unstable_cache`.
 */
export const unstable_cache = vi.fn((fn) => fn);

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Espía de Claves de Caché**: ((Vigente)) Expandir el mock para capturar las claves de caché y permitir a las pruebas verificar que los datos se están cacheando correctamente.
 */
// tests/mocks/next-cache.ts
