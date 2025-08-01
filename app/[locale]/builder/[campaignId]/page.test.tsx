// app/[locale]/builder/[campaignId]/page.test.tsx
/**
 * @file page.test.tsx
 * @description Arnés de pruebas para el Server Component de la página del constructor.
 *              Valida los flujos de seguridad, la obtención de datos, el manejo de
 *              errores y la correcta hidratación del store de Zustand en el servidor.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Initial Test Harness)
 */
import { render, screen, waitFor } from "@testing-library/react";
import { redirect, notFound } from "next/navigation";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useBuilderStore } from "@/app/[locale]/builder/core/store";
import { campaigns as campaignsData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

import BuilderPage from "./page";

// --- Simulación de Dependencias (Mocks) ---
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  campaigns: {
    getCampaignContentById: vi.fn(),
  },
}));

vi.mock("@/app/[locale]/builder/core/store", () => ({
  useBuilderStore: {
    setState: vi.fn(),
  },
}));

vi.mock("@/components/builder/Canvas", () => ({
  Canvas: () => <div data-testid="mock-canvas"></div>,
}));

const mockUser = { id: "user-123", email: "test@example.com" };
const mockCampaignData = {
  id: "campaign-abc",
  name: "Campaña de Prueba",
  content: {
    id: "campaign-abc",
    name: "Campaña de Prueba",
    theme: { globalFont: "Inter", globalColors: {} },
    blocks: [],
  },
};

describe("Arnés de Pruebas: BuilderPage Server Component", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  it("Seguridad: debe redirigir al login si el usuario no está autenticado", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    // Renderizamos el componente (que es una Promesa)
    const pagePromise = BuilderPage({ params: { campaignId: "any-id" } });
    // Esperamos a que la promesa resuelva para que se ejecuten las aserciones
    await expect(pagePromise).resolves.toBeUndefined();
    expect(redirect).toHaveBeenCalledWith("/login?next=/builder/any-id");
  });

  it("Manejo de Errores: debe llamar a notFound si la campaña no existe o no hay permisos", async () => {
    vi.mocked(campaignsData.getCampaignContentById).mockResolvedValue(null);
    const pagePromise = BuilderPage({ params: { campaignId: "not-found-id" } });
    await expect(pagePromise).resolves.toBeUndefined();
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("Manejo de Errores: debe llamar a notFound si la obtención de datos falla", async () => {
    vi.mocked(campaignsData.getCampaignContentById).mockRejectedValue(
      new Error("Database connection failed")
    );
    const pagePromise = BuilderPage({ params: { campaignId: "db-error-id" } });
    await expect(pagePromise).resolves.toBeUndefined();
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("Camino Feliz: debe hidratar el store y renderizar el Canvas con datos válidos", async () => {
    vi.mocked(campaignsData.getCampaignContentById).mockResolvedValue(
      mockCampaignData
    );
    const setStateSpy = vi.spyOn(useBuilderStore, "setState");

    const PageComponent = await BuilderPage({
      params: { campaignId: "campaign-abc" },
    });
    render(PageComponent);

    await waitFor(() => {
      // 1. Verificar que el store de Zustand fue hidratado con los datos correctos
      expect(setStateSpy).toHaveBeenCalledWith({
        campaignConfig: mockCampaignData.content,
      });

      // 2. Verificar que el componente Canvas se renderizó
      expect(screen.getByTestId("mock-canvas")).toBeInTheDocument();
    });
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de la Lógica de Cache**: Añadir una prueba que simule la función `cache` de Next.js. Se podría espiar `campaignsData.getCampaignContentById` y llamar al `BuilderPage` dos veces con los mismos parámetros para asegurar que la función de datos solo es invocada una vez.
 * 2.  **Validación de Datos de Fallback**: Añadir una prueba específica que simule que `campaignData.content` es nulo y verifique que el objeto `campaignConfig` se construye correctamente con la estructura de bloques por defecto, validando el flujo de onboarding para campañas nuevas.
 * 3.  **Pruebas de Accesibilidad (a11y)**: Aunque es un componente de servidor, se puede integrar `jest-axe` en la prueba del "Camino Feliz" para analizar el HTML renderizado y asegurar que cumple con los estándares básicos de accesibilidad.
 */
// app/[locale]/builder/[campaignId]/page.test.tsx
