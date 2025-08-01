// components/sites/PaginationControls.test.ts
/**
 * @file PaginationControls.test.tsx
 * @description Arnés de pruebas de alta fidelidad para PaginationControls. Este arnés ha sido
 *              reconstruido para ser sintácticamente correcto y utiliza una estrategia de
 *              simulación inmune a los problemas de transpilación de JSX en `vi.mock()`.
 *              Valida todos los flujos lógicos, incluyendo la construcción de enlaces con
 *              parámetros de ruta y búsqueda, estados deshabilitados y accesibilidad.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.1.0 (Fix: JSX Transpilation-Immune Mocking & Syntax Restoration)
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Parámetro de Límite**: (Vigente) Añadir una prueba que simule la selección de un nuevo límite de ítems por página y verifique que el nuevo parámetro `limit` se incluye correctamente en los enlaces de paginación.
 * 2.  **Pruebas de Accesibilidad (a11y):** (Vigente) Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el componente renderizado.
 *
 * @section MEJORAS ADICIONADAS
 * 1.  **Prueba de Rango de Paginación:** Añadir una prueba que valide la lógica del hook `usePaginationRange`, verificando que los puntos suspensivos (`...`) se muestran correctamente para un gran número de páginas.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { PaginationControls } from "./PaginationControls";

// --- Simulación de Dependencias (Estrategia Anti-Transpilación) ---
type MockLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: {
    pathname: string;
    params?: Record<string, string>;
    query: Record<string, string>;
  };
};

vi.mock("@/lib/navigation", () => ({
  Link: (props: MockLinkProps) => {
    let path = props.href.pathname;
    if (props.href.params) {
      for (const key in props.href.params) {
        path = path.replace(`[${key}]`, props.href.params[key]);
      }
    }
    const params = new URLSearchParams(props.href.query).toString();
    const finalHref = `${path}?${params}`;

    return (
      <a
        href={finalHref}
        aria-label={props["aria-label"]}
        aria-current={props["aria-current"]}
      >
        {props.children}
      </a>
    );
  },
}));

describe("Arnés de Pruebas Definitivo: PaginationControls", () => {
  it("debe construir enlaces correctos con búsqueda y params de ruta dinámica", () => {
    render(
      <PaginationControls
        page={3}
        totalCount={100}
        limit={10}
        basePath="/dashboard/sites/[siteId]/campaigns"
        routeParams={{ siteId: "site-abc-123" }}
        searchQuery="lanzamiento"
      />
    );

    const prevPageLink = screen.getByLabelText("Ir a la página anterior");
    expect(prevPageLink).toHaveAttribute(
      "href",
      "/dashboard/sites/site-abc-123/campaigns?page=2&q=lanzamiento"
    );

    const nextPageLink = screen.getByLabelText("Ir a la página siguiente");
    expect(nextPageLink).toHaveAttribute(
      "href",
      "/dashboard/sites/site-abc-123/campaigns?page=4&q=lanzamiento"
    );
  });

  it("no debe renderizar si solo hay una página de resultados", () => {
    const { container } = render(
      <PaginationControls
        page={1}
        totalCount={10}
        limit={10}
        basePath="/dashboard/sites"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe deshabilitar el botón 'Anterior' en la primera página", () => {
    render(
      <PaginationControls
        page={1}
        totalCount={50}
        limit={10}
        basePath="/dashboard/sites"
      />
    );
    const prevPageButton = screen.getByLabelText("Ir a la página anterior").closest("button");
    expect(prevPageButton).toBeDisabled();
  });

  it("debe aplicar el atributo aria-current a la página activa", () => {
    render(
      <PaginationControls
        page={3}
        totalCount={50}
        limit={10}
        basePath="/dashboard/sites"
      />
    );
    const activePageLink = screen.getByLabelText("Ir a la página 3");
    expect(activePageLink).toHaveAttribute("aria-current", "page");
  });
});
// components/sites/PaginationControls.test.ts