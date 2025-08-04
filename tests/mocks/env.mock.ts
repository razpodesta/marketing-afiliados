// tests/mocks/env.mock.ts
/**
 * @file env.mock.ts
 * @description Módulo de simulación atómico para las variables de entorno.
 *              Centraliza la definición de todas las variables de `process.env`
 *              necesarias para el entorno de pruebas, incluyendo las de Vercel KV.
 * @author L.I.A Legacy
 * @version 2.0.0 (Vercel KV Integration)
 */
import { vi } from "vitest";

export function setupEnvironmentMocks() {
  vi.stubGlobal("process", {
    ...process,
    env: {
      ...process.env,
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "mock-service-key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_ROOT_DOMAIN: "localhost:3000",
      // --- INICIO DE REFACTORIZACIÓN KV ---
      // KV_REST_API_URL y KV_REST_API_TOKEN son necesarios para Vercel KV
      KV_REST_API_URL: "https://mock-kv-url.vercel.app",
      KV_REST_API_TOKEN: "mock-kv-token",
      // --- FIN DE REFACTORIZACIÓN KV ---
    },
  });
}
// tests/mocks/env.mock.ts
