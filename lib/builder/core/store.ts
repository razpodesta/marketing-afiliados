// lib/builder/core/store.ts
/**
 * @file store.ts
 * @description Almacén de estado global de Zustand para el constructor. Ha sido refactorizado
 *              con una implementación de historial (undo/redo) manual, simple y de alto
 *              rendimiento para eliminar dependencias externas y garantizar la máxima estabilidad.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 6.1.0 (Manual History Type-Safe Refactor)
 *
 * @see {@link file://./store.test.ts} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para el store del constructor.
 *
 * 1.  **Middleware de Persistencia en `localStorage`**: (Vigente) Integrar el middleware `persist` de Zustand para guardar `campaignConfig`.
 * 2.  **Uso de Immer para Mutaciones Inmutables**: (Vigente) Integrar el middleware `immer` para simplificar las actualizaciones de estado anidado.
 * 3.  **Límites de Historial**: (Vigente) Añadir lógica para limitar el tamaño de los arrays `pastStates` y `futureStates` para optimizar el uso de memoria.
 */
import { arrayMove } from "@dnd-kit/sortable";
import { create, type StateCreator } from "zustand";

import { type CampaignConfig, type PageBlock } from "@/lib/builder/types.d";

export type DevicePreview = "desktop" | "tablet" | "mobile";

interface HistoryState {
  pastStates: CampaignConfig[];
  futureStates: CampaignConfig[];
}

export interface BuilderState extends HistoryState {
  campaignConfig: CampaignConfig | null;
  selectedBlockId: string | null;
  isSaving: boolean;
  devicePreview: DevicePreview;
  setCampaignConfig: (config: CampaignConfig) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  updateBlockProp: (blockId: string, propName: string, value: unknown) => void;
  addBlock: (blockType: string, defaultProps: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  duplicateBlock: (blockId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setDevicePreview: (device: DevicePreview) => void;
  undo: () => void;
  redo: () => void;
}

const createBuilderSlice: StateCreator<BuilderState, [], []> = (set) => ({
  campaignConfig: null,
  selectedBlockId: null,
  isSaving: false,
  devicePreview: "desktop",
  pastStates: [],
  futureStates: [],

  // Acciones que NO se registran en el historial
  setCampaignConfig: (config) =>
    set({ campaignConfig: config, pastStates: [], futureStates: [] }),
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  setIsSaving: (isSaving) => set({ isSaving }),

  // Acciones que SÍ se registran en el historial
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
      const newConfig = { ...state.campaignConfig, blocks: newBlocks };
      return {
        campaignConfig: newConfig,
        selectedBlockId: newBlock.id,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
    }),

  deleteBlock: (blockId) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.filter(
        (b) => b.id !== blockId
      );
      const newConfig = { ...state.campaignConfig, blocks: newBlocks };
      return {
        campaignConfig: newConfig,
        selectedBlockId:
          state.selectedBlockId === blockId ? null : state.selectedBlockId,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
    }),

  updateBlockProp: (blockId, propName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.map((block) =>
        block.id === blockId
          ? { ...block, props: { ...block.props, [propName]: value } }
          : block
      );
      const newConfig = { ...state.campaignConfig, blocks: newBlocks };
      return {
        campaignConfig: newConfig,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
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
      const newConfig = { ...state.campaignConfig, blocks: newBlocks };
      return {
        campaignConfig: newConfig,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
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
      const newConfig = { ...state.campaignConfig, blocks: newBlocks };
      return {
        campaignConfig: newConfig,
        selectedBlockId: newBlock.id,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
    }),

  // Lógica de historial manual
  undo: () =>
    set((state) => {
      const { pastStates, futureStates, campaignConfig } = state;
      if (pastStates.length === 0 || !campaignConfig) return {};
      const previousState = pastStates[pastStates.length - 1];
      const newPastStates = pastStates.slice(0, pastStates.length - 1);
      const newFutureStates = [campaignConfig, ...futureStates];
      return {
        campaignConfig: previousState,
        pastStates: newPastStates,
        futureStates: newFutureStates,
      };
    }),

  redo: () =>
    set((state) => {
      const { pastStates, futureStates, campaignConfig } = state;
      if (futureStates.length === 0 || !campaignConfig) return {};
      const nextState = futureStates[0];
      const newFutureStates = futureStates.slice(1);
      const newPastStates = [...pastStates, campaignConfig];
      return {
        campaignConfig: nextState,
        pastStates: newPastStates,
        futureStates: newFutureStates,
      };
    }),
});

export const useBuilderStore = create<BuilderState>()(createBuilderSlice);
// lib/builder/core/store.ts
