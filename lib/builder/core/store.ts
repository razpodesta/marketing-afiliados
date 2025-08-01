// Ruta: lib/builder/core/store.ts
/**
 * @file store.ts
 * @description Almacén de estado global de Zustand para el constructor. Esta es la
 *              ÚNICA fuente de verdad para el estado del editor de campañas en toda la aplicación.
 *              Contiene el estado de la configuración de la campaña, el bloque seleccionado,
 *              estados de UI y todas las acciones para modificar el estado de forma inmutable.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.2.0 (Canonical Source of Truth)
 */
import { arrayMove } from "@dnd-kit/sortable";
import { create, type StateCreator } from "zustand";
// Futura mejora: importar middlewares de Zustand si se implementan persistencia/historial.
// import { persist } from 'zustand/middleware';
// import { temporal } from 'zustand/middleware';

import { type CampaignConfig, type PageBlock } from "@/lib/builder/types.d";

export type DevicePreview = "desktop" | "tablet" | "mobile";

interface BuilderState {
  campaignConfig: CampaignConfig | null;
  selectedBlockId: string | null;
  isSaving: boolean;
  devicePreview: DevicePreview;
  setCampaignConfig: (config: CampaignConfig) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  updateBlockProp: (blockId: string, propName: string, value: unknown) => void;
  updateBlockStyle: (blockId: string, styleName: string, value: string) => void;
  addBlock: (blockType: string, defaultProps: Record<string, unknown>) => void;
  moveBlock: (activeId: string, overId: string) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setDevicePreview: (device: DevicePreview) => void;
  moveBlockByStep: (blockId: string, direction: "up" | "down") => void;
}

const createBuilderSlice: StateCreator<BuilderState> = (set) => ({
  campaignConfig: null,
  selectedBlockId: null,
  isSaving: false,
  devicePreview: "desktop",

  setCampaignConfig: (config) =>
    set({ campaignConfig: config, selectedBlockId: null }),
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  setIsSaving: (isSaving) => set({ isSaving }),

  moveBlockByStep: (blockId, direction) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const { blocks } = state.campaignConfig;
      const index = blocks.findIndex((b) => b.id === blockId);

      if (index === -1) return {};
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return {};

      const newBlocks = arrayMove(blocks, index, newIndex);
      return { campaignConfig: { ...state.campaignConfig, blocks: newBlocks } };
    }),

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
        selectedBlockId:
          state.selectedBlockId === blockId ? null : state.selectedBlockId,
      };
    }),

  duplicateBlock: (blockId) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const blockToDuplicate = state.campaignConfig.blocks.find(
        (b) => b.id === blockId
      );
      const blockIndex = state.campaignConfig.blocks.findIndex(
        (b) => b.id === blockId
      );
      if (!blockToDuplicate || blockIndex === -1) return {};

      const newBlock: PageBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
      };
      const newBlocks = [...state.campaignConfig.blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);

      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
        selectedBlockId: newBlock.id,
      };
    }),
});

// Futuras mejoras con middlewares:
// export const useBuilderStore = create<BuilderState>()(
//   persist( // Para guardar en localStorage
//     temporal( // Para historial (undo/redo)
//       createBuilderSlice,
//       {
//         // Opciones de temporal o persist
//       }
//     ),
//     {
//       name: "builder-storage", // Nombre del item en localStorage
//       partialize: (state) => ({ campaignConfig: state.campaignConfig }), // Solo persiste la configuración
//     }
//   )
// );

export const useBuilderStore = create<BuilderState>(createBuilderSlice);

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Middleware de Persistencia en `localStorage`:** Integrar el middleware `persist` de Zustand para guardar automáticamente el estado del constructor (especialmente `campaignConfig`) en el `localStorage` del navegador. Esto protegería el trabajo del usuario contra cierres accidentales de la pestaña o fallos del navegador, permitiéndole retomar su trabajo exactamente donde lo dejó.
 * 2.  **Middleware de Historial (Undo/Redo):** Utilizar el middleware `temporal` de Zustand para implementar un historial de cambios. Esto permitiría a los usuarios deshacer y rehacer acciones con `Ctrl+Z` y `Ctrl+Y`, una característica fundamental en cualquier editor de nivel profesional, con una implementación mínima en el store.
 * 3.  **Uso de Immer para Mutaciones Inmutables:** Integrar el middleware `immer` de Zustand para simplificar drásticamente las acciones que modifican estados anidados, como `updateBlockProp`. Permitiría escribir código que "muta" el estado de forma más directa y legible, mientras Immer se encarga de la inmutabilidad por debajo, manteniendo la garantía de inmutabilidad.
 * 4.  **Optimización del `Date.now()` para IDs:** Aunque `Date.now()` es conveniente para generar IDs únicos de bloques, en un entorno de alta concurrencia (aunque menos probable en un editor de un solo usuario), podría haber colisiones o problemas con el tiempo. Para una robustez extrema, se podría usar una librería de generación de UUIDs (ej. `uuid` o `nanoid`) para asegurar IDs verdaderamente únicos.
 */
