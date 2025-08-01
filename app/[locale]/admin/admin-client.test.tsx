// app/[locale]/admin/admin-client.test.tsx
/**
 * @file admin-client.test.tsx
 * @description Arnés de pruebas de producción para el componente AdminClient.
 *              Valida el renderizado, el estado vacío, y el flujo de eliminación
 *              utilizando el ConfirmationDialog genérico. Se ha corregido el tipado
 *              del mock de la Server Action para un cumplimiento estricto del contrato.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 2.1.0 (Strict Mock Typing)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { admin, session } from "@/lib/actions";
import { type ActionResult } from "@/lib/validators";
import { AdminClient } from "./admin-client";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
  useFormatter: () => ({
    dateTime: (date: Date) => date.toLocaleDateString(),
  }),
}));

vi.mock("@/lib/actions", () => ({
  admin: {
    deleteSiteAsAdminAction: vi.fn(),
  },
  session: {
    signOutAction: vi.fn(),
  },
}));

vi.mock("react-hot-toast");

const mockUser = {
  id: "admin-user-id",
  email: "admin@metashark.com",
  user_metadata: { full_name: "Admin User" },
};

const mockSites = [
  { subdomain: "site-alpha", icon: "🚀", createdAt: new Date().getTime() },
  { subdomain: "site-beta", icon: "🧪", createdAt: new Date().getTime() },
];

describe("Arnés de Pruebas: app/[locale]/admin/admin-client.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el encabezado y la lista de sitios correctamente", () => {
    render(
      <AdminClient
        sites={mockSites}
        user={mockUser as any}
        totalCount={2}
        page={1}
        limit={10}
      />
    );
    expect(screen.getByText("headerTitle")).toBeInTheDocument();
    expect(
      screen.getByText('welcomeMessage {"username":"Admin User"}')
    ).toBeInTheDocument();
    expect(screen.getByText("site-alpha")).toBeInTheDocument();
    expect(screen.getByText("site-beta")).toBeInTheDocument();
  });

  it("debe renderizar el estado vacío si no se proporcionan sitios", () => {
    render(
      <AdminClient
        sites={[]}
        user={mockUser as any}
        totalCount={0}
        page={1}
        limit={10}
      />
    );
    expect(screen.getByText("noSubdomains")).toBeInTheDocument();
    expect(screen.queryByText("site-alpha")).not.toBeInTheDocument();
  });

  it("debe abrir el ConfirmationDialog y llamar a la acción de eliminar al confirmar", async () => {
    // --- INICIO DE CORRECCIÓN (TS2345) ---
    // Se define explícitamente el tipo del mock para que coincida con la rama
    // de éxito de la unión discriminada `ActionResult`.
    const mockSuccessResult: ActionResult<{ message: string }> = {
      success: true,
      data: { message: "Sitio eliminado con éxito." },
    };
    vi.mocked(admin.deleteSiteAsAdminAction).mockResolvedValue(
      mockSuccessResult
    );
    // --- FIN DE CORRECCIÓN ---

    render(
      <AdminClient
        sites={mockSites}
        user={mockUser as any}
        totalCount={2}
        page={1}
        limit={10}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /Eliminar/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Sí, eliminar sitio/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(admin.deleteSiteAsAdminAction).toHaveBeenCalledTimes(1);
    });

    const formData = vi.mocked(admin.deleteSiteAsAdminAction).mock.calls[0][0];
    expect(formData.get("subdomain")).toBe("site-alpha");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Sitio eliminado con éxito.");
    });
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Paginación**: (Vigente) Añadir una prueba que verifique que el componente `PaginationControls` se renderiza con los props correctos y que los enlaces de paginación se construyen adecuadamente.
 * 2.  **Prueba del Flujo de Error**: (Vigente) Simular que `deleteSiteAsAdminAction` devuelve `{ success: false, error: '...' }` y verificar que se muestra un `toast.error` con el mensaje correcto.
 * 3.  **Prueba de Estado de Carga**: (Vigente) Renderizar el componente y simular el estado de carga (`isPending` y `deletingSiteId`) para verificar que el botón de confirmación en el diálogo está deshabilitado y muestra el spinner.
 */
// app/[locale]/admin/admin-client.test.tsx
