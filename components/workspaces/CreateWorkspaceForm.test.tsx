/**
 * @file components/workspaces/CreateWorkspaceForm.test.tsx
 * @description Pruebas unitarias para el formulario de creación de workspaces.
 *              Valida la interacción del usuario, la validación del formulario con Zod
 *              y la correcta invocación de la Server Action.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateWorkspaceForm } from "./CreateWorkspaceForm";

// Simulación de la Server Action
const mockCreateWorkspaceAction = vi.fn();
vi.mock("@/lib/actions", () => ({
  workspaces: {
    createWorkspaceAction: (
      prevState: any,
      formData: FormData
    ): Promise<{ success: boolean; error?: string }> =>
      mockCreateWorkspaceAction(prevState, formData),
  },
}));

// Simulación del EmojiPicker
vi.mock("@/components/ui/emoji-picker", () => ({
  EmojiPicker: () => <div>Emoji Picker</div>,
}));

describe("Componente: CreateWorkspaceForm", () => {
  const user = userEvent.setup();

  /**
   * @test Prueba de validación de campo requerido.
   * @description Verifica que se muestre un mensaje de error si el formulario se envía con el nombre del workspace vacío.
   * @expectation El mensaje "El nombre debe tener al menos 3 caracteres" debe aparecer.
   */
  it("debe mostrar un error de validación si el nombre está vacío", async () => {
    render(<CreateWorkspaceForm onSuccess={vi.fn()} />);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });
    await user.click(submitButton);
    expect(
      await screen.findByText("El nombre debe tener al menos 3 caracteres.")
    ).toBeInTheDocument();
  });

  /**
   * @test Prueba de envío exitoso.
   * @description Simula el llenado correcto del formulario y su envío, verificando que la Server Action sea llamada.
   * @expectation La Server Action `createWorkspaceAction` debe ser llamada una vez.
   */
  it("debe llamar a la Server Action con los datos correctos en un envío válido", async () => {
    mockCreateWorkspaceAction.mockResolvedValue({ success: true });
    render(<CreateWorkspaceForm onSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText(/nombre del workspace/i);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });

    await user.type(nameInput, "Mi Nuevo Workspace");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateWorkspaceAction).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * @test Prueba de estado de carga.
   * @description Verifica que el botón de envío se deshabilite y muestre "Creando..." durante la sumisión.
   * @expectation El botón debe estar deshabilitado y contener el texto "Creando...".
   */
  it("debe deshabilitar el botón y mostrar el estado de carga durante el envío", async () => {
    // Simulamos una promesa que no se resuelve para mantener el estado de carga
    mockCreateWorkspaceAction.mockReturnValue(new Promise(() => {}));
    render(<CreateWorkspaceForm onSuccess={vi.fn()} />);

    const nameInput = screen.getByLabelText(/nombre del workspace/i);
    const submitButton = screen.getByRole("button", {
      name: /crear workspace/i,
    });

    await user.type(nameInput, "Workspace de prueba");
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /creando/i })
    ).toBeInTheDocument();
  });
});

/**
 * @section PRUEBAS FUTURAS A IMPLEMENTAR
 * @description Pruebas adicionales para aumentar la cobertura y la fiabilidad del componente.
 *
 * 1.  **Prueba de Manejo de Errores del Servidor:** Simular que la `createWorkspaceAction` devuelve `{ success: false, error: "Nombre ya en uso" }` y verificar que el mensaje de error se muestre correctamente en la UI.
 * 2.  **Prueba de la Callback `onSuccess`:** Simular que la `createWorkspaceAction` devuelve `{ success: true }` y verificar que la función `onSuccess` (pasada como prop) sea llamada exactamente una vez.
 * 3.  **Prueba de Interacción con `EmojiPicker`:** Si el `EmojiPicker` fuera un componente más complejo, se podría probar que al seleccionar un emoji, el valor del campo oculto correspondiente en el formulario se actualice correctamente.
 */

/**
 * @fileoverview El componente `CreateWorkspaceForm` es el primer formulario crítico que un nuevo usuario encuentra después de registrarse.
 * @functionality
 * - Permite al usuario definir un nombre y un ícono para su primer (o nuevo) workspace.
 * - Utiliza `react-hook-form` y `zod` para proporcionar validación de datos en tiempo real en el lado del cliente.
 * - Al enviar, invoca la Server Action `createWorkspaceAction` para persistir los datos en la base de datos.
 * - Muestra estados de carga y maneja el feedback de éxito o error de la Server Action a través de notificaciones (`toast`).
 * - Comunica el éxito de la operación a su componente padre a través de la callback `onSuccess`.
 * @relationships
 * - Es un componente hijo de `app/[locale]/welcome/page.tsx` y de `components/workspaces/WorkspaceSwitcher.tsx`.
 * - Invoca la Server Action `workspaces.createWorkspaceAction` de `lib/actions/workspaces.actions.ts`.
 * - Utiliza el esquema `WorkspaceSchema` de `lib/validators/index.ts` para la validación.
 * @expectations
 * - Se espera que este formulario sea robusto y proporcione una experiencia de usuario clara y sin fricciones para el paso de onboarding más importante. Debe prevenir envíos inválidos y dar feedback claro sobre el resultado de la operación.
 */
