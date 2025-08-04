// tests/mocks/browser.mock.ts
/**
 * @file browser.mock.ts
 * @description Módulo de simulación atómico para las APIs del navegador.
 *              Centraliza la simulación de APIs como `matchMedia`, `IntersectionObserver`, etc.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { vi } from "vitest";

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

export function setupBrowserMocks() {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  vi.stubGlobal("setTimeout", vi.fn(setTimeout));
  vi.stubGlobal("clearTimeout", vi.fn(clearTimeout));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
}
