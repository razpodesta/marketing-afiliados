// tests/utils/factories.ts
/**
 * @file factories.ts
 * @description Módulo de factorías para la creación de datos de prueba consistentes.
 *              Este aparato es fundamental para aplicar el principio DRY en las pruebas
 *              y garantizar que los datos simulados siempre cumplan con los contratos de tipo.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { type User } from "@supabase/supabase-js";
import { type SiteWithCampaignsCount } from "@/lib/data/sites";

/**
 * @function createMockUser
 * @description Crea un objeto de usuario simulado con valores por defecto.
 * @param {Partial<User>} overrides - Un objeto para sobrescribir los valores por defecto.
 * @returns {Partial<User>} Un objeto de usuario simulado.
 */
export const createMockUser = (
  overrides: Partial<User> = {}
): Partial<User> => ({
  id: "mock-user-id-123",
  email: "test@example.com",
  user_metadata: { full_name: "Mock User" },
  ...overrides,
});

/**
 * @function createMockSite
 * @description Crea un objeto de sitio simulado que cumple con el tipo `SiteWithCampaignsCount`.
 * @param {Partial<SiteWithCampaignsCount>} overrides - Un objeto para sobrescribir los valores por defecto.
 * @returns {SiteWithCampaignsCount} Un objeto de sitio simulado.
 */
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

/**
 * @calificacion 10/10
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Contratos de Tipo Fuertes**: ((Implementada)) Las factorías están tipadas explícitamente, garantizando que los datos de prueba generados sean siempre consistentes con los tipos de la aplicación.
 * 2. **Principio DRY**: ((Implementada)) Centraliza la creación de datos de prueba, eliminando la duplicación y facilitando el mantenimiento.
 *
 * @subsection Melhorias Futuras
 * 1. **Factorías para Todas las Entidades**: ((Vigente)) Expandir este módulo para incluir factorías para todas las entidades críticas del sistema (`Workspace`, `Campaign`, `Invitation`), creando un conjunto de herramientas de prueba completo.
 * 2. **Integración con Librerías de Falsificación**: ((Vigente)) Integrar una librería como `Faker.js` para generar datos más realistas y variados en las factorías.
 */
// tests/utils/factories.ts
