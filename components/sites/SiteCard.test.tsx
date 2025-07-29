/**
 * @file components/sites/SiteCard.test.tsx
 * @description Pruebas unitarias para el componente `SiteCard`.
 *              Verifica el correcto renderizado de la información del sitio y,
 *              críticamente, la construcción correcta de los enlaces de navegación
 *              internos y externos.
 * @author L.I.A Legacy
 * @version 2.1.0 (Corrected Mock Typing)
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SiteWithCampaignsCount } from "@/lib/data/sites";

import { SiteCard } from "./SiteCard";

// --- INICIO DE CORRECCIÓN: Tipado de Simulación (Mock Typing) ---
// Se define un tipo para las props del Link simulado.
// Es CRÍTICO usar Omit para eliminar la prop 'href' original de los atributos de <a>,
// que es un 'string', antes de añadir nuestra propia definición de 'href' que
// puede ser un objeto. Esto previene una colisión de tipos.
type MockLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string | { pathname: string; params: Record<string, string> };
};

// Se simula el módulo de navegación para aislar el componente.
vi.mock("@/navigation", () => ({
  Link: (props: MockLinkProps) => {
    let finalHref: string;
    if (typeof props.href === "string") {
      finalHref = props.href;
    } else {
      // Si href es un objeto, construimos la URL dinámicamente.
      let path = props.href.pathname;
      for (const key in props.href.params) {
        path = path.replace(`[${key}]`, props.href.params[key]);
      }
      finalHref = path;
    }
    // Devolvemos una etiqueta <a> real con la URL construida.
    // Omitimos el resto de las props que no son válidas para un <a>, como 'params'.
    const { href, ...anchorProps } = props;
    return (
      <a href={finalHref} {...anchorProps}>
        {props.children}
      </a>
    );
  },
}));
// --- FIN DE CORRECCIÓN ---

const mockSite: SiteWithCampaignsCount = {
  id: "site-id-123",
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
    // La aserción ahora pasará porque el mock construye la URL correctamente.
    expect(campaignsLink).toHaveAttribute(
      "href",
      "/dashboard/sites/site-id-123/campaigns"
    );
  });

  it("debe renderizar el enlace externo al subdominio público", () => {
    render(
      <SiteCard
        site={mockSite}
        onDelete={vi.fn()}
        isPending={false}
        deletingSiteId={null}
      />
    );

    const externalLink = screen
      .getByRole("link", {
        name: "Abrir sitio en una nueva pestaña", // Asumiendo que se añade un aria-label para accesibilidad
      })
      .closest("a");
    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute(
      "href",
      "http://mi-sitio-de-prueba.localhost:3000"
    );
  });
});

/**
 * @section PRUEBAS FUTURAS A IMPLEMENTAR
 * @description Pruebas adicionales para aumentar la cobertura y la fiabilidad del componente.
 *
 * 1.  **Prueba de Interacción con Popover:** Simular un evento de `hover` o `click` en la tarjeta y verificar que el contenido del componente `PopoverContent` se renderice correctamente en el DOM.
 * 2.  **Prueba de Flujo de Eliminación:** Simular un clic en el botón de eliminar, verificar que el `DeleteSiteDialog` se abre, y confirmar que al hacer clic en el botón de confirmación dentro del diálogo, la función `onDelete` (pasada como prop) es llamada con el `FormData` correcto.
 * 3.  **Prueba de Estado de Carga:** Renderizar el componente con `isPending={true}` y `deletingSiteId` coincidiendo con el `mockSite.id`. Verificar que el botón de eliminar dentro del `DeleteSiteDialog` esté en estado deshabilitado para prevenir clics duplicados.
 */

/**
 * @fileoverview El aparato de pruebas `SiteCard.test.tsx` es una red de seguridad de fiabilidad.
 * @functionality
 * - **Aislamiento:** Utiliza `vi.mock` para simular dependencias externas como `@/navigation`. Esto aísla el componente `SiteCard`, asegurando que estamos probando su lógica interna y no la de sus dependencias.
 * - **Simulación Precisa:** La simulación del componente `Link` ahora maneja correctamente la prop `href` tanto si es una cadena de texto como si es un objeto (para rutas dinámicas), que era la causa de fallos anteriores.
 * - **Pruebas de Renderizado:** Verifica que la información básica del sitio (subdominio, conteo de campañas) se muestre correctamente en el DOM.
 * - **Pruebas de Contrato de Navegación:** La prueba más crítica ("debe construir y renderizar el enlace...") valida que el componente utilice la API de navegación correctamente para construir una URL dinámica, asegurando que la navegabilidad no se rompa en futuras refactorizaciones.
 * @relationships
 * - Valida el componente `components/sites/SiteCard.tsx`.
 * - Depende de la configuración definida en `vitest.config.ts` y `vitest.setup.ts` para su correcto funcionamiento (entorno `jsdom`, `alias` de rutas, `matchers` de DOM).
 * @expectations
 * - Se espera que esta suite de pruebas falle si se introduce una regresión en el componente `SiteCard`, como un cambio en la forma en que se muestran los datos o, más importante, un cambio que rompa la lógica de construcción de enlaces. Actúa como un guardián de la funcionalidad principal del componente.
 */
