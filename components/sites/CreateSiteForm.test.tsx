// components/sites/CreateSiteForm.test.tsx
/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas de integración para el formulario CreateSiteForm.
 *              Valida la interacción cohesiva entre el formulario principal y su
 *              componente hijo especializado `SubdomainInput`, manejando
 *              correctamente los temporizadores asíncronos (`debounce`) para
 *              garantizar pruebas rápidas, estables y deterministas.
 * @author L.I.A Legacy & RaZ Podestá (Validator)
 * @co-author MetaShark
 * @version 6.0.0 (Fix: Definitive Contextual Rendering via Hook Mocking)
 * @see {@link file://./CreateSiteForm.tsx} Para el aparato de producción bajo prueba.
 *
 * @section TÁCTICA DE PRUEBA
 * 1.  **Mocking de Hook:** En lugar de envolver en un Provider, se simula
 *     directamente el hook `useDashboard`. Esto es más limpio, desacoplado y
 *     resuelve el fallo de renderizado en su raíz al proveer el contexto
 *     necesario a cualquier componente hijo que lo consuma.
 * 2.  **Orquestación Asíncrona Definitiva:** Se utiliza `vi.useFakeTimers()` para controlar
 *     el tiempo. Cada interacción del usuario y avance de tiempo se envuelven en
 *     `act()` para asegurar que React procese todas las actualizaciones de estado
 *     pendientes antes de las aserciones. Esto erradica los timeouts.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Accesibilidad (a11y):** (Vigente) Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el formulario renderizado.
 * 2.  **Prueba de Estado de Carga:** (Vigente) Añadir una prueba que simule `isPending` como `true` y verifique que el botón de envío esté deshabilitado.
 *
 * @section MEJORAS ADICIONADAS
 * 1.  **Factoría de Mocks Compartida:** Mover la configuración del mock de `useDashboard` a un archivo de utilidades de prueba para reutilizarlo en otros componentes que dependan del mismo contexto.
 */
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDashboard } from "@/lib/context/DashboardContext";
import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteForm } from "./CreateSiteForm";

// --- Simulación de Dependencias ---
vi.mock("@/lib/actions", () => ({
  sites: {
    createSiteAction: vi.fn(),
    checkSubdomainAvailabilityAction: vi.fn(),
  },
}));
vi.mock("react-hot-toast");

// CORRECCIÓN ESTRUCTURAL: Mockear el hook directamente
vi.mock("@/lib/context/DashboardContext");

describe("Arnés de Pruebas: components/sites/CreateSiteForm.tsx", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Configura el mock del hook para que devuelva un valor válido y completo
    vi.mocked(useDashboard).mockReturnValue({
      user: { id: "user-123" },
      workspaces: [{ id: "ws-456", name: "Test WS" }],
      activeWorkspace: { id: "ws-456", name: "Test WS" },
      pendingInvitations: [],
      modules: [],
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Validación en Cliente: debe mostrar un error si el subdominio es inválido", async () => {
    // Arrange
    render(<CreateSiteForm onSuccess={mockOnSuccess} workspaceId="ws-456" />);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await act(async () => {
      await user.type(subdomainInput, "dominio invalido");
      await user.click(submitButton);
    });

    // Assert
    const alert = await screen.findByRole("alert", {
      name: /Error de subdominio/i,
    });
    expect(alert).toHaveTextContent(
      "Solo se permiten letras minúsculas, números y guiones."
    );
    expect(sitesActions.createSiteAction).not.toHaveBeenCalled();
  });

  it("Camino Feliz: debe llamar a la Server Action y a onSuccess con datos válidos", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });
    vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
      success: true,
      data: { id: "new-site-id" },
    });

    render(<CreateSiteForm onSuccess={mockOnSuccess} workspaceId="ws-456" />);
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await act(async () => {
      await user.type(nameInput, "Mi Sitio Válido");
      await user.type(subdomainInput, "sitio-disponible");
      await vi.advanceTimersByTimeAsync(500);
    });

    await act(async () => {
      await user.click(submitButton);
    });

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
    });

    const formDataSent = vi.mocked(sitesActions.createSiteAction).mock
      .calls[0][0];
    expect(formDataSent.get("name")).toBe("Mi Sitio Válido");
    expect(formDataSent.get("subdomain")).toBe("sitio-disponible");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("¡Sitio creado con éxito!");
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
// components/sites/CreateSiteForm.test.tsx
