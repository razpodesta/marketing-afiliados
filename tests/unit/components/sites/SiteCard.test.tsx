// tests/components/sites/SiteCard.test.tsx
/**
 * @file components/sites/SiteCard.test.tsx
 * @description Arnés de pruebas para el componente `SiteCard`. Valida el
 *              correcto renderizado de la información del sitio y la construcción
 *              de los enlaces de navegación.
 * @author L.I.A Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 4.0.0 (Parallel Architecture Migration)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteCard } from "@/components/sites/SiteCard";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";

// --- Simulación (Mocking) de Dependencias ---
type MockLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string | { pathname: string; params: Record<string, string> };
};

vi.mock("@/lib/navigation", () => ({
  Link: (props: MockLinkProps) => {
    let finalHref: string;
    if (typeof props.href === "string") {
      finalHref = props.href;
    } else {
      let path = props.href.pathname;
      for (const key in props.href.params) {
        path = path.replace(`[${key}]`, props.href.params[key]);
      }
      finalHref = path;
    }
    const { href, ...anchorProps } = props;
    return (
      <a href={finalHref} {...anchorProps}>
        {props.children}
      </a>
    );
  },
}));
vi.mock("@/components/sites/DeleteSiteDialog", () => ({
  DeleteSiteDialog: () => <button>Eliminar</button>,
}));

// --- Datos de Prueba (Test Data) ---
const mockSite: SiteWithCampaignsCount = {
  id: "site-id-123",
  name: "Mi Sitio de Prueba",
  description: "Descripción para el sitio de prueba.",
  subdomain: "mi-sitio-de-prueba",
  icon: "🧪",
  created_at: new Date().toISOString(),
  workspace_id: "ws-1",
  owner_id: "user-1",
  custom_domain: null,
  updated_at: null,
  campaigns: [{ count: 5 }],
};

describe("Componente: SiteCard", () => {
  it("debe renderizar la información básica del sitio correctamente", () => {
    render(
      <SiteCard
        site={mockSite}
        onDelete={vi.fn()}
        isPending={false}
        deletingSiteId={null}
      />
    );

    expect(screen.getByText("mi-sitio-de-prueba")).toBeInTheDocument();
    expect(screen.getByText("5 Campañas")).toBeInTheDocument();
  });

  it("debe construir y renderizar el enlace de navegación a campañas correctamente", () => {
    render(
      <SiteCard
        site={mockSite}
        onDelete={vi.fn()}
        isPending={false}
        deletingSiteId={null}
      />
    );

    const campaignsLink = screen.getByRole("link", {
      name: /gestionar campañas/i,
    });
    expect(campaignsLink).toBeInTheDocument();
    expect(campaignsLink).toHaveAttribute(
      "href",
      "/dashboard/sites/site-id-123/campaigns"
    );
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Interacción de Eliminación**: ((Vigente)) Añadir una prueba que simule un clic en el botón de eliminar y verifique que `onDelete` se pasa correctamente al `DeleteSiteDialog`.
 *
 * @subsection Mejoras Implementadas
 * 1. **Corrección de Rutas de Importación**: ((Implementada)) Se han corregido las importaciones para usar alias, resolviendo el fallo de inicialización.
 * 2. **Sincronización de Contrato de Tipos**: ((Implementada)) El mock de `mockSite` está actualizado para coincidir con `SiteWithCampaignsCount`.
 */
// tests/components/sites/SiteCard.test.tsx
