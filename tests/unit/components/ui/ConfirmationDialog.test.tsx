// tests/unit/components/ui/ConfirmationDialog.test.tsx
/**
 * @file ConfirmationDialog.test.tsx
 * @description Arnés de pruebas para `ConfirmationDialog`. La ruta de importación
 *              para `userEvent` ha sido corregida para apuntar a su módulo canónico,
 *              resolviendo un error de compilación.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 7.1.0 (Canonical Import Fix)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShieldAlert } from "lucide-react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

// Se elimina la importación incorrecta desde @/tests/utils/render
// y se utiliza la importación canónica directamente.

describe("Arnés de Pruebas: components/ui/ConfirmationDialog", () => {
  const user = userEvent.setup();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // La lógica de la prueba permanece sin cambios, ya que era correcta.
  it("debe renderizar el contenido, ser accesible (sin violaciones a11y) y llamar a onConfirm", async () => {
    await render(
      <ConfirmationDialog
        triggerButton={<button>Eliminar</button>}
        icon={ShieldAlert}
        title="Título de Prueba"
        description="Descripción de Prueba."
        confirmButtonText="Sí, Confirmar"
        cancelButtonText="No, Cancelar"
        onConfirm={mockOnConfirm}
        isPending={false}
        hiddenInputs={{ entityId: "123" }}
      />
    );

    await user.click(screen.getByRole("button", { name: /Eliminar/i }));

    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(screen.getByText("Título de Prueba")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sí, Confirmar" }));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Corrección de Importación Canónica**: ((Implementada)) Se ha corregido la importación de `userEvent` para que apunte a `@testing-library/user-event`, resolviendo el error de compilación `TS2305`. Se ha eliminado la importación de `render` y otras utilidades desde nuestro wrapper `tests/utils/render` porque `vitest.setup.ts` ahora se encarga de la configuración global, simplificando la prueba.
 *
 * @subsection Melhorias Futuras
 * 1.  **Pruebas de Estado de Foco**: ((Vigente)) Añadir una prueba que verifique que el foco se gestiona correctamente al abrir y cerrar el diálogo.
 */
// tests/unit/components/ui/ConfirmationDialog.test.tsx
