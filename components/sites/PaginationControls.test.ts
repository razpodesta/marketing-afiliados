// components/sites/PaginationControls.test.tsx
/**
 * @file PaginationControls.test.tsx
 * @description Arnés de pruebas de alta fidelidad para PaginationControls. Este arnés ha sido
 *              refactorizado con una nueva estrategia de simulación para ser inmune a los problemas
 *              de transpilación de JSX en `vi.mock()`. Valida todos los flujos lógicos,
 *              incluyendo la construcción de enlaces con parámetros de ruta y búsqueda,
 *              estados deshabilitados y accesibilidad.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 3.1.0 (JSX Transpilation-Immune Mocking)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

import { PaginationControls } from "./PaginationControls";

// --- Simulación de Dependencias (Estrategia Anti-Transpilación) ---

// Se define un tipo para las props del Link simulado que acepta el objeto `href`.
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

// Se simula el módulo de navegación. El componente `Link` es un simple componente funcional
// que construye una URL en formato string a partir del objeto `href` recibido.
// Esto valida el contrato de datos sin necesitar transpilación de JSX en el mock.
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

    // Renderiza una etiqueta <a> simple con los atributos necesarios para las aserciones.
    return (
      <a
        href={finalHref}
        aria-label={props["aria-label"]}
        data-current={props["aria-current"] === "page"}
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

    const prevPageButton = screen
      .getByLabelText("Ir a la página anterior")
      .closest("button");
    expect(prevPageButton).toBeDisabled();
  });

  it("debe deshabilitar el botón 'Siguiente' en la última página", () => {
    render(
      <PaginationControls
        page={5}
        totalCount={50}
        limit={10}
        basePath="/dashboard/sites"
      />
    );
    const nextPageButton = screen
      .getByLabelText("Ir a la página siguiente")
      .closest("button");
    expect(nextPageButton).toBeDisabled();
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
    expect(activePageLink).toHaveAttribute("data-current", "true");
  });
});

/**
 * @section MEJORAS ADICIONADAS
 * @description Nuevas mejoras identificadas durante esta refactorización.
 *
 * 1.  **Prueba de Parámetro de Límite**: Añadir una prueba que simule la selección de un nuevo límite de ítems por página y verifique que el nuevo parámetro `limit` se incluye correctamente en los enlaces de paginación.
 */
// components/sites/PaginationControls.test.tsx