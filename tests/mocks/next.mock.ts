// tests/mocks/next.mock.ts
/**
 * @file next.mock.ts
 * @description Módulo de simulación atómico para dependencias de Next.js.
 *              El mock de `redirect` ha sido refactorizado para ser pasivo,
 *              resolviendo un conflicto crítico con las pruebas de Server Actions.
 * @author L.I.A Legacy
 * @version 2.0.0
 */
import { vi } from "vitest";

export function setupNextMocks() {
  vi.mock("next/cache", () => ({
    unstable_cache: vi.fn((fn) => fn),
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  }));

  // El mock de redirect ahora es pasivo. Las pruebas que necesiten
  // verificar si fue llamado deberán espiarlo explícitamente.
  vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => "/mock-path"),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    redirect: vi.fn(),
  }));
}
