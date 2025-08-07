// vitest.setup.ts
/**
 * @file vitest.setup.ts
 * @description Archivo de preparación del entorno de pruebas. Ha sido refactorizado
 *              para eliminar los stubs de temporizadores globales, que interferían
 *              con la mecánica interna de `@testing-library/user-event` y causaban
 *              timeouts. Esta corrección estabiliza toda la suite de pruebas de interacción.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 15.0.0 (Interaction Test Stability Fix)
 */
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// --- REFACTORIZACIÓN CRÍTICA ---
// Se han eliminado los stubs globales para `setTimeout`, `clearTimeout`, etc.
// Las pruebas que requieran control sobre el tiempo deben usar `vi.useFakeTimers()`
// de forma local para no afectar a otras pruebas.

vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    cache: (fn: any) => fn,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/mock-path"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Estabilidad de Pruebas de Interacción**: ((Implementada)) Se han eliminado los stubs de temporizadores globales (`setTimeout`, etc.) que causaban conflictos con `@testing-library/user-event`, resolviendo los fallos de timeout de forma definitiva.
 * 2. **Alineación con Mejores Prácticas**: ((Implementada)) La manipulación de temporizadores ahora se delega a las pruebas individuales que lo requieran (`vi.useFakeTimers()`), lo que constituye una arquitectura de pruebas más robusta y desacoplada.
 *
 * @subsection Melhorias Futuras
 * 1. **Mock de `use` Hook**: ((Vigente)) Si en el futuro se utiliza el hook `use()` de React, se deberá añadir un mock similar aquí para mantener la compatibilidad con el entorno de pruebas JSDOM.
 */
// vitest.setup.ts
