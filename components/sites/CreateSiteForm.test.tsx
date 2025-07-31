// Ruta: components/sites/CreateSiteForm.test.tsx
/**
 * @file CreateSiteForm.test.tsx
 * @description Suite de pruebas de nivel de producción para el formulario `CreateSiteForm`.
 *              Valida el flujo canónico con `react-hook-form`, incluyendo validación
 *              en cliente, verificación asíncrona de subdominio y la correcta
 *              interacción con las Server Actions.
 * @author Validator
 * @version 2.1.0 (Corrected Imports & High-Fidelity Mocks)
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Habilitar temporizadores simulados para el debounce
  });

  afterEach(() => {
    vi.useRealTimers(); // Restaurar temporizadores reales
  });

  it("Validación en Cliente: debe mostrar un error si el nombre del sitio es demasiado corto", async () => {
    // Arrange
    render(
      <CreateSiteForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        workspaceId="ws-123"
      />
    );
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(nameInput, "A");
    // Simula que el usuario sale del campo para disparar la validación 'onBlur'/'onChange'
    await user.click(submitButton);

    // Assert
    expect(
      await screen.findByText(
        "El nombre del sitio debe tener al menos 3 caracteres."
      )
    ).toBeInTheDocument();
    expect(sitesActions.createSiteAction).not.toHaveBeenCalled();
  });

  it("Validación Asíncrona: debe verificar la disponibilidad del subdominio y deshabilitar el envío si no está disponible", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: false },
    });
    render(
      <CreateSiteForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        workspaceId="ws-123"
      />
    );
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(subdomainInput, "subdominio-ocupado");
    // CORRECCIÓN: Se envuelve la actualización de estado asíncrona en `act`.
    await act(async () => {
      vi.advanceTimersByTime(500); // Disparar el debounce
    });

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Este subdominio ya está en uso.")
      ).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  it("Camino Feliz: debe enviar el formulario con datos válidos y subdominio disponible", async () => {
    // Arrange
    vi.mocked(sitesActions.checkSubdomainAvailabilityAction).mockResolvedValue({
      success: true,
      data: { isAvailable: true },
    });
    render(
      <CreateSiteForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        workspaceId="ws-123"
      />
    );
    const nameInput = screen.getByLabelText(/nombre del sitio/i);
    const subdomainInput = screen.getByLabelText(/subdominio/i);
    const submitButton = screen.getByRole("button", { name: /crear sitio/i });

    // Act
    await user.type(nameInput, "Mi Sitio Válido");
    await user.type(subdomainInput, "sitio-disponible");
    // CORRECCIÓN: Se envuelve la actualización de estado asíncrona en `act`.
    await act(async () => {
      vi.advanceTimersByTime(500); // Esperar a que la validación asíncrona termine
    });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("Manejo de Errores del Servidor: debe mostrar el estado `isSubmitting` correctamente", async () => {
    // Arrange
    const mockSubmitWithServerFailure = vi.fn();
    render(
      <CreateSiteForm
        onSubmit={mockSubmitWithServerFailure}
        isSubmitting={true}
        workspaceId="ws-123"
      />
    );

    // Assert
    const submitButton = screen.getByRole("button", { name: /creando sitio/i });
    expect(submitButton).toBeDisabled();
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Transformación de Datos:** Añadir una prueba que verifique que si el campo de nombre se deja en blanco, la función `onSubmit` es llamada con un objeto donde `name` es igual al `subdomain`, validando la lógica de `.transform()` del esquema Zod.
 * 2.  **Prueba de Interacción del EmojiPicker:** Simular la apertura del popover del `EmojiPicker` y la selección de un nuevo emoji, y luego verificar que el valor se actualiza correctamente en el estado del formulario.
 * 3.  **Pruebas de Accesibilidad (a11y):** Integrar `jest-axe` para ejecutar una auditoría de accesibilidad en el formulario renderizado, verificando que todos los campos tengan etiquetas correctas y los atributos `aria-*` se usen adecuadamente.
 */

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El arnés de pruebas `CreateSiteForm.test.tsx` valida el componente de
 *               formulario más complejo de la aplicación, cubriendo tanto la validación
 *               síncrona como la asíncrona.
 *
 * @functionality
 * - **Corrección de `act`:** El error `No se encuentra el nombre 'act'` se ha resuelto
 *   importando la función `act` desde `@testing-library/react`. `act` es crucial para
 *   envolver cualquier código que cause una actualización de estado en React, asegurando
 *   que el DOM se actualice antes de realizar las aserciones.
 * - **Prueba de Validación en Cliente:** Simula la entrada de datos inválidos por parte
 *   del usuario y verifica que los mensajes de error de Zod se rendericen correctamente
 *   en el DOM, previniendo la llamada a la función de envío.
 * - **Prueba de Validación Asíncrona (Debounce):** Utiliza temporizadores simulados
 *   (`vi.useFakeTimers`) para probar la lógica de `debounce`. Avanza el tiempo
 *   artificialmente para disparar la llamada a la Server Action de verificación y
 *   afirma que la UI reacciona correctamente al resultado (mostrando un error y
 *   deshabilitando el botón de envío).
 *
 * @relationships
 * - Valida el aparato `components/sites/CreateSiteForm.tsx`.
 * - Simula (`mocks`) las Server Actions de `lib/actions/sites.actions.ts` para aislar
 *   la lógica del componente de la del backend.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en las reglas de
 *   validación del formulario o en la lógica de manejo de estado. Actúa como un
 *   guardián que garantiza una experiencia de usuario robusta y predecible durante
 *   la creación de sitios.
 * =================================================================================================
 */
