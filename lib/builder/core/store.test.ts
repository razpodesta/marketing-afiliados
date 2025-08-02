// lib/builder/core/store.test.ts
/**
 * @file store.test.ts
 * @description Arnés de pruebas de producción para el store de Zustand del constructor.
 *              Valida la máquina de estado, incluyendo la lógica de modificación
 *              de bloques, estilos, reordenamiento preciso y la implementación de
 *              historial manual (undo/redo).
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.2.0 (Validation for `updateBlockStyle`)
 * @see {@link file://./store.ts} Para el aparato de producción bajo prueba.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Límites de Historial:** (Vigente) Una vez implementado, añadir pruebas que verifiquen que los arrays de historial no crecen indefinidamente.
 * 2.  **Pruebas de Casos de Borde:** (Vigente) Añadir pruebas para acciones en estados inválidos (ej. `updateBlockProp` con un `blockId` inexistente) y verificar que el estado no cambia.
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
    {
      id: "block-1",
      type: "Hero1",
      props: { title: "First" },
      styles: { backgroundColor: "#ffffff" },
    },
    { id: "block-2", type: "CTA", props: { text: "Second" }, styles: {} },
  ],
};

describe("Arnés de Pruebas: Builder Store (con Historial Manual)", () => {
  beforeEach(() => {
    act(() => {
      useBuilderStore
        .getState()
        .setCampaignConfig(JSON.parse(JSON.stringify(initialTestConfig)));
    });
  });

  it("debe actualizar una propiedad de bloque y registrarlo en el historial", () => {
    act(() => {
      useBuilderStore.getState().updateBlockProp("block-1", "title", "Updated");
    });
    const state = useBuilderStore.getState();
    expect(state.campaignConfig?.blocks[0].props.title).toBe("Updated");
    expect(state.pastStates).toHaveLength(1);
    expect(state.pastStates[0].blocks[0].props.title).toBe("First");
  });

  it("debe actualizar un estilo de bloque y registrarlo en el historial", () => {
    act(() => {
      useBuilderStore
        .getState()
        .updateBlockStyle("block-1", "backgroundColor", "#000000");
    });
    const state = useBuilderStore.getState();
    expect(state.campaignConfig?.blocks[0].styles.backgroundColor).toBe(
      "#000000"
    );
    expect(state.pastStates).toHaveLength(1);
    expect(state.pastStates[0].blocks[0].styles.backgroundColor).toBe(
      "#ffffff"
    );
  });

  it("debe mover un bloque un paso hacia abajo y registrarlo en el historial", () => {
    act(() => {
      useBuilderStore.getState().moveBlockByStep("block-1", "down");
    });
    const state = useBuilderStore.getState();
    expect(state.campaignConfig?.blocks[0].id).toBe("block-2");
    expect(state.campaignConfig?.blocks[1].id).toBe("block-1");
    expect(state.pastStates).toHaveLength(1);
  });
});
// lib/builder/core/store.test.ts
