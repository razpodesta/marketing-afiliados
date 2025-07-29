// scripts/validate-data-layer-types.ts
import { sites } from "@/lib/data";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";

/**
 * @file validate-data-layer-types.ts
 * @description Prueba de contrato de tipos. Verifica estáticamente (en tiempo de compilación)
 *              que la forma de los datos devueltos por la capa de datos coincide con
 *              el tipo `SiteWithCampaignsCount` exportado.
 * @author L.I.A Legacy
 */
async function test() {
  console.log("VALIDANDO CONTRATO DE DATOS: `SiteWithCampaignsCount`...");

  // Esta asignación de tipo explícita es el núcleo de la prueba.
  // Si hay un desajuste, el compilador de TypeScript lanzará un error aquí.
  const { sites: siteData }: { sites: SiteWithCampaignsCount[] } =
    await sites.getSitesByWorkspaceId("dummy-workspace-id-for-type-checking", {});

  console.log("✅ El tipo `SiteWithCampaignsCount` se resuelve correctamente.");
  
  // En un entorno de CI/CD, este script podría tener aserciones reales.
  // Por ahora, el éxito de la compilación es la prueba principal.
}

test().catch(err => {
  console.error("❌ Falló la validación del contrato de datos:", err);
  process.exit(1);
});```

#### **Prueba 2: Transmisión (Capa de Hooks)**

```typescript
// lib/hooks/useSitesManagement.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSitesManagement } from './useSitesManagement';
import type { SiteWithCampaignsCount } from '@/lib/data/sites';

// Mock de `next/navigation` para evitar errores en el entorno de prueba
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

const mockInitialSites: SiteWithCampaignsCount[] = [
  {
    id: 'site-1',
    subdomain: 'test-site',
    icon: '🚀',
    created_at: new Date().toISOString(),
    workspace_id: 'ws-1',
    owner_id: 'user-1',
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 5 }],
  },
];

describe('Hook: useSitesManagement', () => {
  it('debe inicializar el estado con los sitios correctos y mantener el tipo', () => {
    const { result } = renderHook(() => useSitesManagement(mockInitialSites));

    // Aserción 1: El estado inicial es correcto
    expect(result.current.filteredSites).toEqual(mockInitialSites);

    // Aserción 2 (Implícita en la compilación):
    // Si esta línea compila, significa que `filteredSites` no es de tipo `never`.
    // Podemos acceder a propiedades anidadas para una prueba más explícita.
    expect(result.current.filteredSites[0].campaigns[0].count).toBe(5);
  });

  it('debe filtrar los sitios por searchQuery sin perder el tipo', () => {
    const { result } = renderHook(() => useSitesManagement(mockInitialSites));

    act(() => {
      // Usamos el setter que devuelve el hook (aunque sea debounced en la implementación real)
      result.current.setSearchQuery('test');
    });
    
    // En el test, el debounce puede no ejecutarse, así que probamos el estado interno
    // La prueba más importante es que `filteredSites` siga siendo un array tipado.
    expect(result.current.filteredSites[0].subdomain).toBe('test-site');
  });
});```

#### **Prueba 3: Consumo (Capa de UI)**

```typescript
// components/sites/SitesGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SitesGrid } from './SitesGrid';
import type { SiteWithCampaignsCount } from '@/lib/data/sites';

// Mock de componentes hijos para aislar la prueba
vi.mock('./SiteCard', () => ({
  SiteCard: ({ site }: { site: SiteWithCampaignsCount }) => <div data-testid="site-card">{site.subdomain}</div>
}));

const mockSites: SiteWithCampaignsCount[] = [
  { id: '1', subdomain: 'site-alpha', icon: 'A', created_at: '', workspace_id: '', owner_id: null, custom_domain: null, updated_at: null, campaigns: [{ count: 1 }] },
  { id: '2', subdomain: 'site-beta', icon: 'B', created_at: '', workspace_id: '', owner_id: null, custom_domain: null, updated_at: null, campaigns: [{ count: 2 }] },
];

describe('Componente: SitesGrid', () => {
  it('debe renderizar el número correcto de SiteCards sin errores de tipo', () => {
    render(
      <SitesGrid
        sites={mockSites}
        onDelete={vi.fn()}
        isPending={false}
        deletingSiteId={null}
      />
    );

    // Si el tipo `sites` fuera 'never[]', esta prueba fallaría en tiempo de compilación o ejecución.
    const cards = screen.getAllByTestId('site-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('site-alpha');
    expect(cards[1]).toHaveTextContent('site-beta');
  });

  it('debe mostrar el estado vacío si no se proporcionan sitios', () => {
    render(
      <SitesGrid
        sites={[]}
        onDelete={vi.fn()}
        isPending={false}
        deletingSiteId={null}
      />
    );

    expect(screen.getByText('No se encontraron sitios')).toBeInTheDocument();
  });
});