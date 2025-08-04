// tests/app/[locale]/admin/admin-client.test.tsx
/**
 * @file admin-client.test.tsx
 * @description Arnés de pruebas de producción para el componente AdminClient.
 *              Ha sido refactorizado para alinearse con la nueva gestión de
 *              estado simplificada, resolviendo los fallos de aserción y
 *              garantizando una validación fiable de los estados de carga.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 8.0.0 (Simplified State Validation)
 */
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminClient } from "@/app/[locale]/admin/admin-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { admin, session } from "@/lib/actions";
import { type ActionResult } from "@/lib/validators";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({ dateTime: (date: Date) => date.toLocaleDateString() }),
}));
vi.mock("@/components/sites", () => ({
  PaginationControls: () => <div data-testid="pagination-controls-mock" />,
}));
vi.mock("@/lib/actions");
vi.mock("react-hot-toast");

// --- Datos de Prueba ---
const mockUser = {
  id: "admin-user-id",
  email: "admin@metashark.com",
  user_metadata: { full_name: "Admin User" },
};
const mockSites = [
  { subdomain: "site-alpha", icon: "🚀", createdAt: new Date().getTime() },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe("Arnés de Pruebas: tests/app/[locale]/admin/admin-client.test.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar un toast de error si la acción de eliminar falla", async () => {
    // Arrange
    const mockErrorResult: ActionResult<any> = {
      success: false,
      error: "Permiso denegado.",
    };
    vi.mocked(admin.deleteSiteAsAdminAction).mockResolvedValue(mockErrorResult);
    renderWithProviders(
      <AdminClient
        sites={mockSites}
        user={mockUser as any}
        totalCount={1}
        page={1}
        limit={10}
      />
    );

    // Act
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
    await user.click(deleteButton);
    const confirmButton = await screen.findByRole("button", {
      name: /Sí, eliminar sitio/i,
    });
    await user.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Permiso denegado.");
    });
  });

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  it("debe mostrar el estado de carga en el botón mientras la acción está pendiente", async () => {
    // Arrange
    let resolveAction: (value: ActionResult<any>) => void;
    const promise = new Promise<ActionResult<any>>((resolve) => {
      resolveAction = resolve;
    });
    vi.mocked(admin.deleteSiteAsAdminAction).mockReturnValue(promise);

    renderWithProviders(
      <AdminClient
        sites={mockSites}
        user={mockUser as any}
        totalCount={1}
        page={1}
        limit={10}
      />
    );

    // Act
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
    await user.click(deleteButton);
    const confirmButton = await screen.findByRole("button", {
      name: /Sí, eliminar sitio/i,
    });
    await user.click(confirmButton);

    // Assert: El estado de carga se muestra inmediatamente después del clic
    const pendingButton = await screen.findByRole("button", {
      name: /Sí, eliminar sitio/i,
    });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton.querySelector("svg.animate-spin")).toBeInTheDocument();

    // Cleanup: resolver la promesa para que la prueba termine limpiamente
    await act(async () => {
      resolveAction({ success: true, data: { message: "Ok" } });
      await promise;
    });
  });
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Implementadas
 * 1. **Validación de Estado Simplificada**: ((Implementada)) La prueba ahora se alinea con la lógica de estado unificada del componente, eliminando la condición de carrera y resolviendo el fallo de aserción.
 */
// tests/app/[locale]/admin/admin-client.test.tsx
