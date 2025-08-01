// components/builder/BuilderHeader.test.tsx
/**
 * @file BuilderHeader.test.tsx
 * @description Arnés de pruebas de producción para el componente BuilderHeader.
 *              Valida el renderizado, los estados de los botones (incluyendo
 *              undo/redo) y la correcta invocación de las acciones del store.
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Test Harness)
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBuilderStore } from "@/lib/builder/core/store";
import { BuilderHeader } from "./BuilderHeader";

// Se simula el store de Zustand por completo
vi.mock("@/lib/builder/core/store");

// Mocks para otras dependencias
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/actions", () => ({
  builder: { updateCampaignContentAction: vi.fn() },
}));

const mockUndo = vi.fn();
const mockRedo = vi.fn();
const mockSetDevicePreview = vi.fn();

describe("Arnés de Pruebas: BuilderHeader", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe deshabilitar los botones de undo/redo cuando el historial está vacío", () => {
    // Arrange
    vi.mocked(useBuilderStore).mockReturnValue({
      pastStates: [],
      futureStates: [],
      undo: mockUndo,
      redo: mockRedo,
      devicePreview: "desktop",
      setDevicePreview: mockSetDevicePreview,
      isSaving: false,
      setIsSaving: vi.fn(),
      campaignConfig: { id: "1" },
    });

    // Act
    render(<BuilderHeader />);

    // Assert
    expect(screen.getByLabelText("Deshacer")).toBeDisabled();
    expect(screen.getByLabelText("Rehacer")).toBeDisabled();
  });

  it("debe habilitar el botón de undo cuando hay estados pasados", () => {
    // Arrange
    vi.mocked(useBuilderStore).mockReturnValue({
      pastStates: [{ id: "config-1" }], // Estado pasado
      futureStates: [],
      undo: mockUndo,
      redo: mockRedo,
      devicePreview: "desktop",
      setDevicePreview: mockSetDevicePreview,
      isSaving: false,
      setIsSaving: vi.fn(),
      campaignConfig: { id: "2" },
    });

    // Act
    render(<BuilderHeader />);

    // Assert
    expect(screen.getByLabelText("Deshacer")).toBeEnabled();
    expect(screen.getByLabelText("Rehacer")).toBeDisabled();
  });

  it("debe llamar a la acción `undo` del store al hacer clic", async () => {
    // Arrange
    vi.mocked(useBuilderStore).mockReturnValue({
      pastStates: [{ id: "config-1" }],
      futureStates: [],
      undo: mockUndo,
      redo: mockRedo,
      devicePreview: "desktop",
      setDevicePreview: mockSetDevicePreview,
      isSaving: false,
      setIsSaving: vi.fn(),
      campaignConfig: { id: "2" },
    });
    render(<BuilderHeader />);
    const undoButton = screen.getByLabelText("Deshacer");

    // Act
    await user.click(undoButton);

    // Assert
    expect(mockUndo).toHaveBeenCalledTimes(1);
  });
});
// components/builder/BuilderHeader.test.tsx
