// tests/integration/app/[locale]/admin/admin-client.test.tsx
/**
 * @file admin-client.test.tsx
 * @description Arnés de pruebas de producción para el componente AdminClient.
 *              Ha sido corregido para proveer datos de prueba que cumplen
 *              con el contrato de tipo `TransformedSite`.
 * @author L.I.A. Legacy & Raz Podestá
 * @version 8.1.0 (Type-Safe Mock Data)
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

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({ dateTime: (date: Date) => date.toLocaleDateString() }),
}));
vi.mock("@/components/shared/PaginationControls", () => ({
  PaginationControls: () => <div data-testid="pagination-controls-mock" />,
}));
vi.mock("@/lib/actions");
vi.mock("react-hot-toast");

const mockUser = {
  id: "admin-user-id",
  email: "admin@metashark.com",
  user_metadata: { full_name: "Admin User" },
};
// --- INICIO DE CORRECCIÓN (TS2322) ---
const mockSites = [
  {
    id: "site-alpha-id",
    subdomain: "site-alpha",
    icon: "🚀",
    createdAt: new Date().getTime(),
  },
];
// --- FIN DE CORRECCIÓN ---

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe("Arnés de Pruebas: tests/app/[locale]/admin/admin-client.test.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar un toast de error si la acción de eliminar falla", async () => {
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

    const deleteButton = screen.getByRole("button", { name: "deleteButton" });
    await user.click(deleteButton);
    const confirmButton = await screen.findByRole("button", {
      name: "deleteDialog.confirmButton",
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Permiso denegado.");
    });
  });

  it("debe mostrar el estado de carga en el botón mientras la acción está pendiente", async () => {
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

    const deleteButton = screen.getByRole("button", { name: "deleteButton" });
    await user.click(deleteButton);
    const confirmButton = await screen.findByRole("button", {
      name: "deleteDialog.confirmButton",
    });
    await user.click(confirmButton);

    const pendingButton = await screen.findByRole("button", {
      name: "deleteDialog.confirmButton",
    });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton.querySelector("svg.animate-spin")).toBeInTheDocument();

    await act(async () => {
      resolveAction({ success: true, data: { message: "Ok" } });
      await promise;
    });
  });
});
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronización de Contrato de Mock**: ((Implementada)) Se ha añadido la propiedad `id` al objeto `mockSites`, alineándolo con el contrato de tipo `TransformedSite` y resolviendo el error de compilación `TS2322`.
 */
// tests/integration/app/[locale]/admin/admin-client.test.tsx
