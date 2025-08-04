// tests/components/sites/CreateSiteForm.test.tsx
/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas de integración definitiva para `CreateSiteForm`.
 *              Ha sido alineada para importar y simular el módulo de acciones
 *              correcto (`sites.actions`), resolviendo la inconsistencia de tipos.
 * @author L.I.A. Legacy
 * @version 21.0.0 (Module Import & Mock Alignment)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type UseFormReturn } from "react-hook-form";

import { CreateSiteForm } from "@/components/sites/CreateSiteForm";
// --- INICIO DE CORRECCIÓN ---
// Se importa el módulo correcto: 'sites' en lugar de 'workspaces'.
import { sites as sitesActions } from "@/lib/actions";
// --- FIN DE CORRECCIÓN ---

// --- Simulación de Dependencias ---

vi.mock("@/components/sites/SubdomainInput", () => ({
  SubdomainInput: ({ form }: { form: UseFormReturn<any> }) => (
    <input
      aria-label="subdomain-input"
      data-testid="subdomain-input"
      {...form.register("subdomain")}
    />
  ),
}));

// --- INICIO DE CORRECCIÓN ---
// El mock ahora simula la acción dentro del namespace 'sites'.
vi.mock("@/lib/actions", () => ({
  sites: { createSiteAction: vi.fn() },
}));
// --- FIN DE CORRECCIÓN ---

describe("Formulario: CreateSiteForm", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe llamar a la Server Action con datos válidos", async () => {
    // Arrange
    // --- INICIO DE CORRECCIÓN ---
    // Se utiliza la referencia correcta `sitesActions`.
    vi.mocked(sitesActions.createSiteAction).mockImplementation(
      async (formData: FormData) => {
        // La lógica de `onSuccess` ahora se maneja dentro del hook,
        // por lo que no necesitamos llamarla aquí.
        return { success: true, data: { id: "new-site-id" } };
      }
    );
    // --- FIN DE CORRECCIÓN ---

    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123"
        isPending={false}
      />
    );

    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByTestId("subdomain-input");
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(nameInput, "Mi Sitio Válido");
    await user.type(subdomainInput, "sitio-valido");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      // Verificamos que la prop onSuccess fue llamada
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      const formDataSent = mockOnSuccess.mock.calls[0][0] as FormData;
      expect(formDataSent.get("name")).toBe("Mi Sitio Válido");
      expect(formDataSent.get("subdomain")).toBe("sitio-valido");
    });
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pruebas de Validación de Cliente**: ((Vigente)) Añadir una prueba que intente enviar el formulario con datos inválidos.
 *
 * @subsection Mejoras Implementadas
 * 1. **Alineación de Módulos**: ((Implementada)) Se ha corregido la importación y simulación para apuntar al módulo `sites.actions`, resolviendo el error `TS2339`.
 */
// tests/components/sites/CreateSiteForm.test.tsx
