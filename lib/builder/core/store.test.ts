// lib/builder/core/store.test.ts
/**
 * @file store.test.ts
 * @description Arnés de pruebas de producción para el store de Zustand del constructor.
 *              Valida la máquina de estado, incluyendo la lógica de modificación
 *              de bloques y la implementación de historial manual (undo/redo).
 * @author L.I.A. Legacy
 * @version 3.0.0 (Manual History Validation)
 */
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useBuilderStore } from "./store";
import { type CampaignConfig } from "../types.d";

const initialTestConfig: CampaignConfig = {
  id: "campaign-test-id",
  name: "Campaña de Prueba",
  theme: { globalFont: "Inter", globalColors: {} },
  blocks: [
    { id: "block-1", type: "Hero1", props: { title: "Initial" }, styles: {} },
  ],
};

describe("Arnés de Pruebas: Builder Store (con Historial Manual)", () => {
  beforeEach(() => {
    act(() => {
      // Usamos una copia profunda para evitar mutaciones entre pruebas
      useBuilderStore
        .getState()
        .setCampaignConfig(JSON.parse(JSON.stringify(initialTestConfig)));
    });
  });

  it("debe actualizar una propiedad de bloque y registrarlo en el historial", () => {
    // Act
    act(() => {
      useBuilderStore.getState().updateBlockProp("block-1", "title", "Updated");
    });

    // Assert
    const state = useBuilderStore.getState();
    expect(state.campaignConfig?.blocks[0].props.title).toBe("Updated");
    expect(state.pastStates).toHaveLength(1);
    expect(state.pastStates[0].blocks[0].props.title).toBe("Initial");
  });

  describe("Funcionalidad de Historial (Undo/Redo)", () => {
    it("debe deshacer (undo) una actualización de propiedad", () => {
      // Arrange
      act(() => {
        useBuilderStore
          .getState()
          .updateBlockProp("block-1", "title", "Updated");
      });

      // Act
      act(() => {
        useBuilderStore.getState().undo();
      });

      // Assert
      const state = useBuilderStore.getState();
      expect(state.campaignConfig?.blocks[0].props.title).toBe("Initial");
      expect(state.pastStates).toHaveLength(0);
      expect(state.futureStates).toHaveLength(1);
    });

    it("debe rehacer (redo) una acción deshecha", () => {
      // Arrange
      act(() => {
        useBuilderStore
          .getState()
          .updateBlockProp("block-1", "title", "Updated");
        useBuilderStore.getState().undo();
      });

      // Act
      act(() => {
        useBuilderStore.getState().redo();
      });

      // Assert
      const state = useBuilderStore.getState();
      expect(state.campaignConfig?.blocks[0].props.title).toBe("Updated");
      expect(state.pastStates).toHaveLength(1);
      expect(state.futureStates).toHaveLength(0);
    });

    it("debe limpiar el historial futuro al realizar una nueva acción", () => {
      // Arrange
      act(() => {
        useBuilderStore
          .getState()
          .updateBlockProp("block-1", "title", "Update 1");
        useBuilderStore.getState().undo();
      });
      expect(useBuilderStore.getState().futureStates).toHaveLength(1);

      // Act: Realizar una nueva acción diferente
      act(() => {
        useBuilderStore
          .getState()
          .updateBlockProp("block-1", "title", "Update 2");
      });

      // Assert
      const state = useBuilderStore.getState();
      expect(state.campaignConfig?.blocks[0].props.title).toBe("Update 2");
      expect(state.futureStates).toHaveLength(0); // El historial futuro debe haber sido purgado
      expect(state.pastStates).toHaveLength(1);
    });
  });
});
// lib/builder/core/store.test.ts
