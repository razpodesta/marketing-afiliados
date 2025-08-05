// vitest.setup.ts
/**
 * @file vitest.setup.ts
 * @description Archivo de preparación del entorno de pruebas.
 *              Ha sido refactorizado para incluir un mock global para `React.cache`,
 *              resolviendo el `TypeError` al ejecutar código de React Server Components
 *              en un entorno JSDOM.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 14.0.0 (React Server API Mocking)
 */
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.stubGlobal("setTimeout", vi.fn());
vi.stubGlobal("clearTimeout", vi.fn());
vi.stubGlobal("setInterval", vi.fn());
vi.stubGlobal("clearInterval", vi.fn());

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---

// Mock global para `React.cache`.
// Esto es necesario porque `cache` es una API de React Server Components
// y no está disponible en el entorno de pruebas JSDOM (cliente).
vi.mock("react", async (importOriginal) => {
  // Importamos el módulo original de React para no perder todas sus funcionalidades.
  const actualReact = await importOriginal<typeof import("react")>();
  return {
    ...actualReact,
    // Sobrescribimos únicamente la exportación 'cache'.
    // Nuestro mock es un "pass-through": simplemente ejecuta la función
    // que se le pasa, ya que no necesitamos la lógica de cacheo en los tests.
    cache: (fn: any) => fn,
  };
});

// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

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
 * @subsection Melhorias Futuras
 * 1. **Mock de `use` Hook**: ((Vigente)) Si en el futuro se utiliza el hook `use()` de React (también para RSC), se deberá añadir un mock similar aquí.
 *
 * @subsection Melhorias Adicionadas
 * 1. **Simulación de `React.cache`**: ((Implementada)) Se ha añadido un mock global para `React.cache`, resolviendo el `TypeError` y permitiendo que los módulos de servidor sean testeados indirectamente.
 */
// vitest.setup.ts
