// tests/utils/factories.ts
/**
 * @file factories.ts
 * @description Módulo de factorías para la creación de datos y mocks de prueba consistentes.
 *              La factoría de mocks de Supabase ha sido blindada para exponer todas
 *              las funciones de simulación, resolviendo errores de `TypeError` en las pruebas.
 * @author L.I.A Legacy
 * @version 3.1.0 (High-Fidelity Mock Exposure)
 */
import { type User } from "@supabase/supabase-js";
import { vi } from "vitest";

import { type SiteWithCampaignsCount } from "@/lib/data/sites";
import { type Tables } from "@/lib/types/database";

// ... (createMockUser, createMockSite, createMockCampaign no cambian)
export const createMockUser = (
  overrides: Partial<User> = {}
): Partial<User> => ({
  id: "mock-user-id-123",
  email: "test@example.com",
  user_metadata: { full_name: "Mock User" },
  ...overrides,
});

export const createMockSite = (
  overrides: Partial<SiteWithCampaignsCount> = {}
): SiteWithCampaignsCount => ({
  id: "mock-site-id-456",
  name: "Mock Site",
  subdomain: "mock-site",
  description: "A mock site for testing.",
  icon: "🧪",
  created_at: new Date().toISOString(),
  updated_at: null,
  workspace_id: "mock-ws-id-789",
  owner_id: "mock-user-id-123",
  custom_domain: null,
  campaigns: [{ count: 1 }],
  ...overrides,
});

export const createMockCampaign = (
  overrides: Partial<Tables<"campaigns">> = {}
): Tables<"campaigns"> => ({
  id: "mock-camp-id-123",
  name: "Mock Campaign",
  slug: "mock-campaign",
  site_id: "mock-site-id-456",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  content: { initial: true },
  affiliate_url: "https://mock.link",
  ...overrides,
});

export type MockSupabaseClient = {
  supabase: any;
  mocks: {
    mockFrom: ReturnType<typeof vi.fn>;
    mockSelect: ReturnType<typeof vi.fn>;
    mockInsert: ReturnType<typeof vi.fn>;
    mockEq: ReturnType<typeof vi.fn>;
    mockOr: ReturnType<typeof vi.fn>;
    mockOrder: ReturnType<typeof vi.fn>;
    mockRange: ReturnType<typeof vi.fn>;
    mockSingle: ReturnType<typeof vi.fn>;
    mockRpc: ReturnType<typeof vi.fn>;
  };
};

export const createMockSupabaseClient = (): MockSupabaseClient => {
  const mockSingle = vi.fn();
  const mockRange = vi.fn();
  const mockInsert = vi.fn();
  const mockRpc = vi.fn();
  const mockOr = vi.fn();
  const mockOrder = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();

  const queryBuilderMock = {
    select: mockSelect.mockReturnThis(),
    insert: mockInsert,
    eq: mockEq.mockReturnThis(),
    or: mockOr.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    single: mockSingle,
    range: mockRange,
  };

  const mockFrom = vi.fn(() => queryBuilderMock);
  const supabase = { from: mockFrom, rpc: mockRpc };

  // Exponer todos los mocks para aserción
  mockOr.mockReturnValue(queryBuilderMock);
  mockOrder.mockReturnValue(queryBuilderMock);

  return {
    supabase,
    mocks: {
      mockFrom,
      mockSelect,
      mockInsert,
      mockEq,
      mockOr,
      mockOrder,
      mockRange,
      mockSingle,
      mockRpc,
    },
  };
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Exposición Completa de Mocks**: ((Implementada)) La factoría ahora retorna todas las funciones mockeadas internas (`mockSelect`, `mockOr`, `mockOrder`, etc.) en su objeto `mocks`, haciéndolas accesibles para configuración y aserción en las pruebas.
 *
 * @subsection Melhorias Futuras
 * 1.  **Factorías para Todas las Entidades**: ((Vigente)) Expandir este módulo para incluir factorías para todas las entidades críticas restantes (`Workspace`, `Invitation`).
 */
// tests/utils/factories.ts
