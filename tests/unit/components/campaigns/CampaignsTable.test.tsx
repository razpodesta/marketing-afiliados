// tests/components/campaigns/CampaignsTable.test.tsx (Nuevo Aparato)
/**
 * @file CampaignsTable.test.tsx
 * @description Arnés de pruebas para el componente de presentación `CampaignsTable`.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import type { Tables } from "@/lib/types/database";

// Mocks
vi.mock("next-intl", () => ({
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));
vi.mock("@/lib/navigation", () => ({
  Link: (props: any) => <a href={props.href.pathname}>{props.children}</a>,
}));

const mockCampaigns: Tables<"campaigns">[] = [
  {
    id: "camp-1",
    name: "Campaña de Prueba",
    slug: "campana-prueba",
    created_at: new Date().toISOString(),
    updated_at: null,
    site_id: "site-1",
    content: null,
    affiliate_url: null,
  },
];

describe("Componente: CampaignsTable", () => {
  it("debe renderizar las filas de la tabla cuando se proporcionan campañas", () => {
    // Arrange
    render(
      <CampaignsTable
        campaigns={mockCampaigns}
        isPending={false}
        mutatingId={null}
        onDelete={vi.fn()}
      />
    );
    // Assert
    expect(screen.getByText("Campaña de Prueba")).toBeInTheDocument();
    expect(screen.getByText("/campana-prueba")).toBeInTheDocument();
  });

  it("debe renderizar el estado vacío cuando no se proporcionan campañas", () => {
    // Arrange
    render(
      <CampaignsTable
        campaigns={[]}
        isPending={false}
        mutatingId={null}
        onDelete={vi.fn()}
      />
    );
    // Assert
    expect(
      screen.getByText("No se han creado campañas para este sitio todavía.")
    ).toBeInTheDocument();
  });
});

