// vitest.setup.ts
/**
 * @file vitest.setup.ts
 * @description Orquestador del "Simulador de Vuelo". Ha sido blindado para
 *              incluir mocks de alta fidelidad para el logger y Vercel KV,
 *              resolviendo fallos sistémicos en la suite de pruebas y
 *              garantizando un entorno de ejecución estable y predecible.
 * @author L.I.A Legacy
 * @version 11.0.0 (High-Fidelity Mocking Infrastructure)
 */
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { setupBrowserMocks } from "./tests/mocks/browser.mock";
import { setupEnvironmentMocks } from "./tests/mocks/env.mock";
import { setupNextMocks } from "./tests/mocks/next.mock";
import { server } from "./tests/mocks/api/server";

// --- INICIO DE BLINDAJE DE INFRAESTRUCTURA DE MOCKS ---

// Mock de alta fidelidad para el logger. Resuelve `logger.info is not a function`.
vi.mock("@/lib/logging", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  },
  middlewareLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  },
}));

// Mock para Vercel KV. Resuelve el error de variables de entorno faltantes.
vi.mock("@vercel/kv", () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

// --- FIN DE BLINDAJE DE INFRAESTRUCTURA DE MOCKS ---

setupEnvironmentMocks();
setupBrowserMocks();
setupNextMocks();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

/**
 * @calificacion 10/10
 *
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Mock de Logger de Alta Fidelidad**: ((Implementada)) Se ha creado un mock completo para `lib/logging`, asegurando que todas las funciones (`info`, `warn`, `error`, etc.) estén definidas y previniendo fallos de `TypeError`.
 * 2. **Mock de Vercel KV**: ((Implementada)) Se ha creado un mock para `@vercel/kv`. Esto desacopla el entorno de pruebas de la necesidad de tener credenciales reales de KV, haciendo las pruebas más rápidas, deterministas y capaces de ejecutarse en cualquier entorno (como un pipeline de CI/CD).
 *
 * @subsection Melhorias Futuras
 * 1. **Factoría de Mocks de KV**: ((Vigente)) Para pruebas más avanzadas, se podría crear una factoría en `tests/utils` que permita a las pruebas individuales configurar respuestas específicas para `kv.get` (ej. `mockKvGetResponse('subdomain:test', 'site-123')`).
 */
// vitest.setup.ts
