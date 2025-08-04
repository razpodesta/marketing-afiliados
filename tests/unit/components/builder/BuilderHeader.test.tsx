// tests/components/builder/BuilderHeader.test.tsx
/**
 * @file BuilderHeader.test.tsx
 * @description Arnés de pruebas de producción para el componente BuilderHeader.
 *              Ha sido refactorizado para utilizar mocks de alta fidelidad que
 *              cumplen estrictamente con el contrato de tipo `CampaignConfig`,
 *              resolviendo errores de `TypeError` causados por estados simulados
 *              incompletos.
 * @author L.I.A. Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 6.1.0 (Strict Type-Safe Mocking)
 * @see {@link file://../../../components/builder/BuilderHeader.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { useBuilderStore } from "@/lib/builder/core/store";
import { type CampaignConfig } from "@/lib/builder/types.d";

// --- Simulación de Dependencias ---
vi.mock("@/lib/builder/core/store");
vi.mock("next/link", () => ({ default: (props: any) => <a {...props} /> }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/actions", () => ({
  builder: { updateCampaignContentAction: vi.fn() },
}));

// --- Factoría de Mocks de Alta Fidelidad y Tipo Seguro ---

const mockBaseConfig: CampaignConfig = {
  id: "campaign-1",
  name: "Campaña Base",
  theme: { globalFont: "Inter", globalColors: {} },
  blocks: [],
};

const createMockStore = (
  overrides: Partial<ReturnType<typeof useBuilderStore.getState>> = {}
) => ({
  pastStates: [],
  futureStates: [],
  undo: vi.fn(),
  redo: vi.fn(),
  devicePreview: "desktop",
  setDevicePreview: vi.fn(),
  isSaving: false,
  setIsSaving: vi.fn(),
  campaignConfig: mockBaseConfig,
  ...overrides,
});

describe("Arnés de Pruebas: BuilderHeader.test.tsx", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBuilderStore).mockReturnValue(createMockStore() as any);
  });

  it("debe invocar la acción `undo` al hacer clic en el botón de deshacer", async () => {
    // Arrange
    const mockPreviousConfig: CampaignConfig = {
      ...mockBaseConfig,
      name: "Estado Anterior",
    };
    const mockUndo = vi.fn();
    vi.mocked(useBuilderStore).mockReturnValue(
      createMockStore({
        pastStates: [mockPreviousConfig],
        undo: mockUndo,
      }) as any
    );

    render(<BuilderHeader />);
    const undoButton = screen.getByLabelText("Deshacer");

    // Act
    await user.click(undoButton);

    // Assert
    await waitFor(() => {
      expect(mockUndo).toHaveBeenCalledTimes(1);
    });
  });

  it("debe invocar la acción `setDevicePreview` al hacer clic en un botón de dispositivo", async () => {
    // Arrange
    const mockSetDevicePreview = vi.fn();
    vi.mocked(useBuilderStore).mockReturnValue(
      createMockStore({ setDevicePreview: mockSetDevicePreview }) as any
    );
    render(<BuilderHeader />);
    const tabletButton = screen.getByLabelText("Vista de Tableta");

    // Act
    await user.click(tabletButton);

    // Assert
    await waitFor(() => {
      expect(mockSetDevicePreview).toHaveBeenCalledWith("tablet");
    });
  });

  it("debe deshabilitar los botones de undo/redo cuando el historial está vacío", () => {
    // Arrange
    render(<BuilderHeader />);

    // Assert
    expect(screen.getByLabelText("Deshacer")).toBeDisabled();
    expect(screen.getByLabelText("Rehacer")).toBeDisabled();
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Estado de Carga**: ((Vigente)) Renderizar el header con `isSaving: true` y verificar que el botón de guardar muestra el estado de "Guardando...".
 *
 * @subsection Mejoras Implementadas
 * 1. **Mocks Estrictamente Tipados y Completos**: ((Implementada)) Se ha creado una factoría `createMockStore` que genera un estado de mock completo y tipado, resolviendo el `TypeError` y previniendo futuras regresiones si se añaden nuevas propiedades al store.
 */
// tests/components/builder/BuilderHeader.test.tsx
