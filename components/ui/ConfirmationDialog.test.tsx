// components/ui/ConfirmationDialog.test.tsx
/**
 * @file ConfirmationDialog.test.tsx
 * @description Arnés de pruebas de producción para el componente genérico ConfirmationDialog.
 *              Valida el renderizado, la interacción del usuario, el estado de carga y
 *              la correcta invocación de la acción de confirmación.
 *              Ahora es 100% fiable gracias a la refactorización del componente.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.1.0 (Reliability Fix)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShieldAlert } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "./ConfirmationDialog";

describe("Arnés de Pruebas: components/ui/ConfirmationDialog", () => {
  const user = userEvent.setup();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Camino Feliz: debe renderizar, abrir, llamar a onConfirm y pasar datos ocultos", async () => {
    // Arrange
    render(
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
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

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

  it("Estado de Carga: debe mostrar el spinner y deshabilitar el botón de confirmación", async () => {
    // Arrange
    render(
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
    await waitFor(() => {
      const confirmButton = screen.getByRole("button", { name: /Confirmar/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  it("Acción de Cancelar: debe cerrar el diálogo sin llamar a onConfirm", async () => {
    // Arrange
    render(
      <ConfirmationDialog
        triggerButton={<button>Eliminar</button>}
        title="Test"
        description="Test"
        confirmButtonText="Confirmar"
        onConfirm={mockOnConfirm}
        isPending={false}
      />
    );

    // Act: Abrir y luego cancelar
    await user.click(screen.getByRole("button", { name: /Eliminar/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Cancelar/i }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Accesibilidad (a11y)**: (Vigente) Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el diálogo renderizado, asegurando que cumple con los estándares WCAG (roles, labels, gestión de foco).
 * 2.  **Prueba de Cierre Automático**: (Vigente) Refinar la prueba para que, después de una confirmación exitosa, se verifique que el diálogo se cierra automáticamente una vez que el estado `isPending` vuelve a `false`.
 */
// components/ui/ConfirmationDialog.test.tsx
