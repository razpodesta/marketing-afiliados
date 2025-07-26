/* Ruta: app/[locale]/builder/core/store.ts */

import { type CampaignConfig, type PageBlock } from "@/lib/builder/types.d";
import { arrayMove } from "@dnd-kit/sortable";
import { create, type StateCreator } from "zustand";

/**
 * @file store.ts
 * @description Almacén de estado global para el constructor.
 * MEJORA FUNCIONAL: Se ha añadido la acción `updateBlockStyle` para permitir
 * la modificación de las propiedades de estilo de un bloque, completando la
 * capacidad de personalización visual del editor.
 *
 * @author Metashark
 * @version 1.5.0 (Style Management)
 */

interface BuilderState {
  campaignConfig: CampaignConfig | null;
  selectedBlockId: string | null;
  isSaving: boolean;
  setCampaignConfig: (config: CampaignConfig) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  updateBlockProp: (blockId: string, propName: string, value: any) => void;
  updateBlockStyle: (blockId: string, styleName: string, value: string) => void; // <-- NUEVA ACCIÓN
  addBlock: (blockType: string, defaultProps: Record<string, any>) => void;
  moveBlock: (activeId: string, overId: string) => void;
  deleteBlock: (blockId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
}

const createBuilderSlice: StateCreator<BuilderState> = (set) => ({
  campaignConfig: null,
  selectedBlockId: null,
  isSaving: false,

  setCampaignConfig: (config) =>
    set({ campaignConfig: config, selectedBlockId: null }),
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),

  updateBlockProp: (blockId, propName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.map((block) =>
        block.id === blockId
          ? { ...block, props: { ...block.props, [propName]: value } }
          : block
      );
      return { campaignConfig: { ...state.campaignConfig, blocks: newBlocks } };
    }),

  // NUEVA ACCIÓN IMPLEMENTADA
  updateBlockStyle: (blockId, styleName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.map((block) =>
        block.id === blockId
          ? { ...block, styles: { ...block.styles, [styleName]: value } }
          : block
      );
      return { campaignConfig: { ...state.campaignConfig, blocks: newBlocks } };
    }),

  addBlock: (blockType, defaultProps) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlock: PageBlock = {
        id: `block-${Date.now()}`,
        type: blockType,
        props: defaultProps,
        styles: {},
      };
      const newBlocks = [...state.campaignConfig.blocks, newBlock];
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
        selectedBlockId: newBlock.id,
      };
    }),

  moveBlock: (activeId, overId) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const oldIndex = state.campaignConfig.blocks.findIndex(
        (b) => b.id === activeId
      );
      const newIndex = state.campaignConfig.blocks.findIndex(
        (b) => b.id === overId
      );
      if (oldIndex === -1 || newIndex === -1) return {};
      const newBlocks = arrayMove(
        state.campaignConfig.blocks,
        oldIndex,
        newIndex
      );
      return { campaignConfig: { ...state.campaignConfig, blocks: newBlocks } };
    }),

  deleteBlock: (blockId) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.filter(
        (b) => b.id !== blockId
      );
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
        selectedBlockId: null,
      };
    }),

  setIsSaving: (isSaving) => set({ isSaving }),
});

export const useBuilderStore = create<BuilderState>(createBuilderSlice);
/* Ruta: app/[locale]/builder/core/store.ts
 * 1. **Middleware de Persistencia en `localStorage`:** Integrar el middleware `persist` de Zustand para guardar automáticamente el estado del constructor en el `localStorage` del navegador. Esto protegería el trabajo del usuario contra cierres accidentales de la pestaña o crashes del navegador.
 * 2. **Historial de Deshacer/Rehacer (Undo/Redo):** Utilizar el middleware `temporal` de Zustand para implementar fácilmente un historial de cambios. Esto permitiría a los usuarios deshacer y rehacer acciones con `Ctrl+Z` y `Ctrl+Y`, una característica fundamental en cualquier editor serio.
 * 3. **Acciones para Manipulación de la Estructura:** Añadir más acciones al store para manejar la lógica de drag-and-drop, como `addBlock(block, index)`, `moveBlock(fromIndex, toIndex)` y `deleteBlock(blockId)`. Esto mantendrá toda la lógica de manipulación del estado centralizada aquí.
 * 1. **Uso de Immer para Mutaciones Inmutables:** Actualizar arrays y objetos anidados de forma inmutable puede ser verboso. Integrar el middleware `immer` de Zustand simplificaría drásticamente las acciones como `updateBlockProp`, permitiendo escribir código que "muta" el estado de forma segura.
 * 2. **Acciones de Copiar/Pegar Bloques:** Añadir acciones `copyBlock(blockId)` y `pasteBlock(index)` al store. Esto permitiría a los usuarios duplicar bloques complejos rápidamente, una característica de productividad muy potente.
 * 3. **Estado de "Guardado":** Añadir una propiedad `isDirty: boolean` al store. Se pondría en `true` cada vez que se modifica la configuración y en `false` después de guardar. Esto permite a la UI mostrar un indicador de "cambios sin guardar" y prevenir que el usuario cierre la pestaña sin guardar.
 */
