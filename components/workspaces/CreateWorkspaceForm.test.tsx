// Ruta: components/workspaces/CreateWorkspaceForm.test.tsx
/**
 * @file CreateWorkspaceForm.test.tsx
 * @description Suite de pruebas de nivel de producción para el formulario `CreateWorkspaceForm`.
 *              Ha sido reconstruida para validar el flujo canónico con `react-hook-form`
 *              y `zodResolver`, asegurando la validación del lado del cliente y la
 *              correcta interacción con la Server Action.
 * @author L.I.A Legacy
 * @version 2.0.0 (Canonical Form Pattern Validation)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";

import { workspaces as workspaceActions } from "@/lib/actions";
import { type ActionResult } from "@/lib/validators";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

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

  it("debe llamar a la callback onSuccess y mostrar un toast de éxito en un envío correcto", async () => {
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
    await user.type(nameInput, "Workspace Exitoso");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "¡Workspace creado con éxito!"
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
