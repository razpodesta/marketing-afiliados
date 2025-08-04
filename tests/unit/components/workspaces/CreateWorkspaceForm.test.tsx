// tests/components/workspaces/CreateWorkspaceForm.test.tsx
/**
 * @file CreateWorkspaceForm.test.tsx
 * @description Suite de pruebas de nivel de producción para el formulario `CreateWorkspaceForm`.
 *              Ha sido reconstruida para validar el flujo canónico con `react-hook-form`
 *              y `zodResolver`, asegurando la validación del lado del cliente y la
 *              correcta interacción con la Server Action, ahora con importaciones corregidas.
 * @author L.I.A Legacy
 * @version 3.0.0 (Parallel Architecture Migration)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateWorkspaceForm } from "@/components/workspaces/CreateWorkspaceForm";
import { workspaces as workspaceActions } from "@/lib/actions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/actions", () => ({
  workspaces: {
    createWorkspaceAction: vi.fn(),
  },
}));

vi.mock("react-hot-toast");

vi.mock("@/components/ui/emoji-picker", () => ({
  EmojiPicker: () => <div data-testid="emoji-picker"></div>,
}));

describe("Componente: CreateWorkspaceForm (Patrón react-hook-form)", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar un error de validación del cliente si el nombre es demasiado corto", async () => {
    // Arrange
    render(<CreateWorkspaceForm onSuccess={mockOnSuccess} />);
    const nameInput = screen.getByLabelText(/nombre del workspace/i);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });

    // Act
    await user.type(nameInput, "AB");
    await user.click(submitButton);

    // Assert
    expect(
      await screen.findByText("El nombre debe tener al menos 3 caracteres.")
    ).toBeInTheDocument();
    expect(workspaceActions.createWorkspaceAction).not.toHaveBeenCalled();
  });

  it("debe llamar a la Server Action con el FormData correcto en un envío válido", async () => {
    // Arrange
    vi.mocked(workspaceActions.createWorkspaceAction).mockResolvedValue({
      success: true,
      data: { id: "new-ws-id" },
    });
    render(<CreateWorkspaceForm onSuccess={mockOnSuccess} />);
    const nameInput = screen.getByLabelText(/nombre del workspace/i);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });

    // Act
    await user.type(nameInput, "Mi Workspace Válido");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(workspaceActions.createWorkspaceAction).toHaveBeenCalledTimes(1);
      const formDataSent = vi.mocked(workspaceActions.createWorkspaceAction)
        .mock.calls[0][0];
      expect(formDataSent.get("workspaceName")).toBe("Mi Workspace Válido");
      expect(formDataSent.get("icon")).toBe("🚀"); // Valor por defecto
    });
  });

  it("debe mostrar un toast de error si la Server Action devuelve un fallo", async () => {
    // Arrange
    vi.mocked(workspaceActions.createWorkspaceAction).mockResolvedValue({
      success: false,
      error: "Error del servidor: Nombre ya en uso.",
    });
    render(<CreateWorkspaceForm onSuccess={mockOnSuccess} />);
    const nameInput = screen.getByLabelText(/nombre del workspace/i);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });

    // Act
    await user.type(nameInput, "Workspace Repetido");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error del servidor: Nombre ya en uso."
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Selección de Emoji**: ((Vigente)) Se podría mejorar el mock del `EmojiPicker` para que simule una selección de emoji por parte del usuario, y luego verificar que el `FormData` enviado a la Server Action contiene el nuevo emoji seleccionado en lugar del valor por defecto.
 *
 * @subsection Mejoras Implementadas
 * 1. **Corrección de Rutas de Importación**: ((Implementada)) Se han corregido las rutas relativas para usar el alias `@/`, resolviendo el fallo de inicialización.
 * 2. **Suite de Pruebas Canónica**: ((Implementada)) La suite ya valida exhaustivamente la lógica de `react-hook-form`, incluyendo la validación del cliente y los flujos de éxito y error de la Server Action.
 */
// tests/components/workspaces/CreateWorkspaceForm.test.tsx
