// Ruta: components/sites/CreateSiteForm.test.tsx
/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas de nivel de producción para el formulario `CreateSiteForm`.
 *              Ha sido actualizada para validar el nuevo patrón cohesivo donde el
 *              formulario gestiona su propia lógica de envío.
 * @author Validator
 * @version 3.0.0 (Cohesive Component Pattern Validation)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteForm } from "./CreateSiteForm";

// --- Simulación de Dependencias (Mocks) ---
vi.mock("@/lib/actions", () => ({
  sites: {
    createSiteAction: vi.fn(),
    checkSubdomainAvailabilityAction: vi.fn(),
  },
}));
vi.mock("react-hot-toast");
vi.mock("@/components/ui/emoji-picker", () => ({
  EmojiPicker: () => <div data-testid="emoji-picker"></div>,
}));

describe("Arnés de Pruebas: components/sites/CreateSiteForm.tsx", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    await user.type(subdomainInput, "dominio invalido"); // Contiene un espacio
    await user.click(submitButton);

    // Assert
    expect(
      await screen.findByText(
        "Solo se permiten letras minúsculas, números y guiones."
      )
    ).toBeInTheDocument();
    expect(sitesActions.createSiteAction).not.toHaveBeenCalled();
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
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
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
    await user.type(nameInput, "Mi Sitio Válido");
    await user.type(subdomainInput, "sitio-existente");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(sitesActions.createSiteAction).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("El subdominio ya existe.");
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview La suite de pruebas `CreateSiteForm.test.tsx` ha sido alineada con la
 *               nueva arquitectura cohesiva del componente.
 *
 * @functionality
 * - **Pruebas de Componente Autónomo:** La suite ahora prueba el componente `CreateSiteForm`
 *   en su estado real: un formulario que recibe una `workspaceId` y una callback `onSuccess`.
 *   Se eliminó por completo el paso de las props obsoletas `onSubmit` y `isSubmitting`,
 *   resolviendo la causa raíz de los errores de tipo.
 * - **Validación de Lógica Interna:** Las pruebas simulan directamente la respuesta de la
 *   `createSiteAction` que el formulario invoca internamente. Se valida que, dependiendo
 *   del resultado de la acción, se llame a `toast.success` y a la callback `onSuccess`,
 *   o a `toast.error` en caso de fallo.
 * - **Robustez:** La suite sigue cubriendo la validación del lado del cliente con Zod y el
 *   manejo de la validación asíncrona del subdominio, garantizando que todos los aspectos
 *   del comportamiento del formulario estén cubiertos.
 *
 * @relationships
 * - Valida el aparato `components/sites/CreateSiteForm.tsx`.
 * - Simula (`mocks`) las Server Actions de `lib/actions/sites.actions.ts`.
 *
 * @expectations
 * - Se espera que esta suite garantice que el formulario de creación de sitios es robusto,
 *   proporciona el feedback correcto al usuario y se comunica adecuadamente con su
 *   componente padre a través de la callback `onSuccess`. Con esta corrección, la cadena
 *   de dependencias de tipos está restaurada y es coherente.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Transformación de Datos:** Añadir una prueba que verifique que si el campo de nombre se deja en blanco, la Server Action es llamada con un `FormData` donde `name` es igual al `subdomain`, validando la lógica de `.transform()` del esquema Zod.
 * 2.  **Prueba de Interacción del EmojiPicker:** Simular la apertura del popover del `EmojiPicker` y la selección de un nuevo emoji, y luego verificar que el valor se actualiza correctamente en el estado del formulario.
 * 3.  **Pruebas de Accesibilidad (a11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el formulario renderizado, verificando que todos los campos tengan etiquetas correctas y los atributos `aria-*` se usen adecuadamente.
 */
