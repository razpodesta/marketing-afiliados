// Ruta: components/sites/CreateSiteForm.test.tsx
/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas de nivel de producción para el formulario `CreateSiteForm`.
 *              Ha sido actualizada para validar el nuevo patrón cohesivo donde el
 *              formulario gestiona su propia lógica de envío, y para reflejar la eliminación
 *              del campo 'icon'.
 * @author Validator (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Icon Field Removal Alignment)
 */
import { render, screen, waitFor, act } from "@testing-library/react"; // Importar 'act' para envolver actualizaciones de estado
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteForm } from "./CreateSiteForm";

// --- Simulación de Dependencias (Mocks) ---
vi.mock("@/lib/actions", () => ({
  sites: {
    createSiteAction: vi.fn(),
    checkSubdomainAvailabilityAction: vi.fn(), // Necesario para SubdomainInput
  },
}));
vi.mock("react-hot-toast");
// EmojiPicker ya no es necesario en CreateSiteForm, por lo tanto, su mock ya no es estrictamente necesario,
// pero lo mantendremos para evitar errores si otras pruebas lo necesitan, o si es un mock genérico.
vi.mock("@/components/ui/emoji-picker", () => ({
  EmojiPicker: () => <div data-testid="emoji-picker"></div>,
}));

describe("Arnés de Pruebas: components/sites/CreateSiteForm.tsx", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Necesario para probar el debounce en SubdomainInput
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Validación en Cliente: debe mostrar un error si el subdominio es inválido", async () => {
    // Arrange
    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123e4567-e89b-12d3-a456-426614174000"
      />
    );
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(subdomainInput, "dominio invalido"); // Contiene un espacio, inválido por regex
    await user.click(submitButton);

    // Assert
    expect(
      await screen.findByText(
        "Solo se permiten letras minúsculas, números y guiones."
      )
    ).toBeInTheDocument();
    expect(sitesActions.createSiteAction).not.toHaveBeenCalled();
  });

  // Nueva prueba para validar que el nombre del sitio se establece correctamente
  it("Validación en Cliente: debe usar el subdominio como nombre si el nombre del sitio es opcional", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });
    vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
      success: true,
      data: { id: "new-site-id" },
    });

    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123e4567-e89b-12d3-a456-426614174000"
      />
    );
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(subdomainInput, "mi-sitio-transformado");
    // No tipamos nada en el campo de nombre para que Zod lo transforme
    await act(async () => {
      vi.advanceTimersByTime(500); // Avanzar temporizadores para el debounce
    });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      const formDataSent = vi.mocked(sitesActions.createSiteAction).mock
        .calls[0][0];
      // Verifica que el 'name' en el FormData sea igual al 'subdomain' debido a la transformación de Zod
      expect(formDataSent.get("name")).toBe("mi-sitio-transformado");
      expect(formDataSent.get("subdomain")).toBe("mi-sitio-transformado");
      expect(toast.success).toHaveBeenCalledWith("¡Sitio creado con éxito!");
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("Camino Feliz: debe llamar a la Server Action y a onSuccess con datos válidos", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });
    vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
      success: true,
      data: { id: "new-site-id" },
    });

    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123e4567-e89b-12d3-a456-426614174000"
      />
    );
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(nameInput, "Mi Sitio Válido");
    await user.type(subdomainInput, "sitio-disponible");
    await act(async () => {
      vi.advanceTimersByTime(500); // Avanzar temporizadores para el debounce
    });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      const formDataSent = vi.mocked(sitesActions.createSiteAction).mock
        .calls[0][0];
      expect(formDataSent.get("name")).toBe("Mi Sitio Válido");
      expect(formDataSent.get("subdomain")).toBe("sitio-disponible");
      // Ya no se envía el icono
      expect(formDataSent.get("icon")).toBeNull();
      expect(toast.success).toHaveBeenCalledWith("¡Sitio creado con éxito!");
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("Manejo de Errores del Servidor: debe mostrar un toast de error si la acción falla", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });
    vi.mocked(sitesActions.createSiteAction).mockResolvedValue({
      success: false,
      error: "El subdominio ya existe.",
    });

    render(
      <CreateSiteForm
        onSuccess={mockOnSuccess}
        workspaceId="ws-123e4567-e89b-12d3-a456-426614174000"
      />
    );
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(nameInput, "Mi Sitio Fallido");
    await user.type(subdomainInput, "sitio-existente");
    await act(async () => {
      vi.advanceTimersByTime(500); // Avanzar temporizadores para el debounce
    });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("El subdominio ya existe.");
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Pruebas de Accesibilidad (a11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el formulario renderizado, verificando que todos los campos tengan etiquetas correctas y los atributos `aria-*` se usen adecuadamente.
 * 2.  **Prueba de Estado de Carga del Botón:** Añadir una prueba que simule el estado `isSubmitting` del formulario y verifique que el botón de envío muestra el spinner y está deshabilitado.
 * 3.  **Pruebas de Validación Asíncrona (SubdomainInput):** Aumentar las pruebas para `SubdomainInput` directamente en su arnés de pruebas dedicado para cubrir más escenarios de disponibilidad (ej. verificar que el icono cambia correctamente).
 */
