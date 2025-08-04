// tests/components/ui/ConfirmationDialog.test.tsx
/**
 * @file ConfirmationDialog.test.tsx
 * @description Arnés de pruebas de producción para el componente ConfirmationDialog.
 *              Valida el ciclo de vida completo del diálogo, que ahora se ejecuta
 *              de forma fiable y sin advertencias de accesibilidad.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 5.2.0 (Stable & Accessible Execution)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShieldAlert } from "lucide-react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("Arnés de Pruebas: components/ui/ConfirmationDialog", () => {
  const user = userEvent.setup();
  const mockOnConfirm = vi.fn();

  // Helper de renderizado que envuelve los componentes en los proveedores necesarios.
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Camino Feliz: debe renderizar, abrir, llamar a onConfirm y pasar datos ocultos", async () => {
    // Arrange
    renderWithProviders(
      <ConfirmationDialog
        triggerButton={<button>Eliminar</button>}
        icon={ShieldAlert}
        title="¿Confirmar acción?"
        description="Esta acción es irreversible."
        confirmButtonText="Sí, proceder"
        onConfirm={mockOnConfirm}
        isPending={false}
        hiddenInputs={{ entityId: "123", type: "test" }}
      />
    );

    // Act: Abrir el diálogo
    await user.click(screen.getByRole("button", { name: /Eliminar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: "¿Confirmar acción?",
    });
    expect(dialog).toBeInTheDocument();

    // Act: Confirmar la acción
    await user.click(screen.getByRole("button", { name: /Sí, proceder/i }));

    // Assert: Verificar que la acción fue llamada con el FormData correcto
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    const formData = mockOnConfirm.mock.calls[0][0] as FormData;
    expect(formData.get("entityId")).toBe("123");
    expect(formData.get("type")).toBe("test");
  });

  it("Estado de Carga: debe mostrar el spinner y deshabilitar botones", async () => {
    // Arrange
    renderWithProviders(
      <ConfirmationDialog
        triggerButton={<button>Eliminar</button>}
        title="Test"
        description="Test"
        confirmButtonText="Confirmar"
        onConfirm={mockOnConfirm}
        isPending={true}
      />
    );

    // Act
    await user.click(screen.getByRole("button", { name: /Eliminar/i }));

    // Assert
    const dialog = await screen.findByRole("dialog", { name: "Test" });
    expect(dialog).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /Confirmar/i });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Implementadas
 * 1. **Estabilidad y Accesibilidad**: ((Implementada)) Gracias a la refactorización del componente de producción, esta suite de pruebas ahora se ejecuta sin advertencias.
 */
// tests/components/ui/ConfirmationDialog.test.tsx
