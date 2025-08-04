// lib/builder/core/store.ts
/**
 * @file store.ts
 * @description Almacén de estado global de Zustand para el constructor. Es la "máquina de estado"
 *              central que gestiona la configuración de la campaña, la selección de bloques,
 *              y el historial de cambios (undo/redo).
 * @author RaZ Podestá & L.I.A Legacy
 * @version 6.3.0 (Fix: Reintroduce `updateBlockStyle` to resolve build regression)
 *
 * @functionality
 * - **Estado Centralizado**: Mantiene un único objeto de estado (`BuilderState`) para toda la UI del constructor.
 * - **Acciones Inmutables**: Proporciona acciones (ej. `updateBlockProp`, `addBlock`) que modifican el estado
 *   de forma inmutable, creando una nueva versión del estado en cada cambio.
 * - **Gestión de Historial**: Implementa una lógica de historial manual (`pastStates`, `futureStates`)
 *   que permite las funcionalidades de deshacer y rehacer.
 * - **Desacoplamiento**: Permite que los componentes de React (Canvas, SettingsPanel, etc.) se
 *   suscriban al estado y reaccionen a los cambios sin necesidad de comunicación directa entre ellos.
 *
 * @relationships
 * - Es importado y utilizado por todos los componentes dentro de `app/[locale]/builder`.
 * - Sus tipos de datos (`CampaignConfig`, `PageBlock`) provienen de `lib/builder/types.d.ts`.
 * - Es hidratado con datos iniciales en `app/[locale]/builder/[campaignId]/page.tsx`.
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
  updateBlockStyle: (blockId: string, styleName: string, value: string) => void;
  addBlock: (blockType: string, defaultProps: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  moveBlockByStep: (blockId: string, direction: "up" | "down") => void;
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

  setCampaignConfig: (config) =>
    set({ campaignConfig: config, pastStates: [], futureStates: [] }),
  setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  setIsSaving: (isSaving) => set({ isSaving }),

  updateBlockProp: (blockId, propName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newConfig = {
        ...state.campaignConfig,
        blocks: state.campaignConfig.blocks.map((block) =>
          block.id === blockId
            ? { ...block, props: { ...block.props, [propName]: value } }
            : block
        ),
      };
      return {
        campaignConfig: newConfig,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
    }),

  updateBlockStyle: (blockId, styleName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newConfig = {
        ...state.campaignConfig,
        blocks: state.campaignConfig.blocks.map((block) =>
          block.id === blockId
            ? { ...block, styles: { ...block.styles, [styleName]: value } }
            : block
        ),
      };
      return {
        campaignConfig: newConfig,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
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
      const newConfig = {
        ...state.campaignConfig,
        blocks: [...state.campaignConfig.blocks, newBlock],
      };
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
      const newConfig = {
        ...state.campaignConfig,
        blocks: state.campaignConfig.blocks.filter((b) => b.id !== blockId),
      };
      return {
        campaignConfig: newConfig,
        selectedBlockId:
          state.selectedBlockId === blockId ? null : state.selectedBlockId,
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
      const newConfig = {
        ...state.campaignConfig,
        blocks: arrayMove(state.campaignConfig.blocks, oldIndex, newIndex),
      };
      return {
        campaignConfig: newConfig,
        pastStates: [...state.pastStates, state.campaignConfig],
        futureStates: [],
      };
    }),

  moveBlockByStep: (blockId, direction) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const { blocks } = state.campaignConfig;
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return {};
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return {};
      const newConfig = {
        ...state.campaignConfig,
        blocks: arrayMove(blocks, index, newIndex),
      };
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

  undo: () =>
    set((state) => {
      const { pastStates, futureStates, campaignConfig } = state;
      if (pastStates.length === 0 || !campaignConfig) return {};
      const previousState = pastStates[pastStates.length - 1];
      const newPastStates = pastStates.slice(0, pastStates.length - 1);
      return {
        campaignConfig: previousState,
        pastStates: newPastStates,
        futureStates: [campaignConfig, ...futureStates],
      };
    }),

  redo: () =>
    set((state) => {
      const { pastStates, futureStates, campaignConfig } = state;
      if (futureStates.length === 0 || !campaignConfig) return {};
      const nextState = futureStates[0];
      const newFutureStates = futureStates.slice(1);
      return {
        campaignConfig: nextState,
        pastStates: [...pastStates, campaignConfig],
        futureStates: newFutureStates,
      };
    }),
});

export const useBuilderStore = create<BuilderState>()(createBuilderSlice);
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Middleware de Persistencia en `localStorage`**: ((Vigente)) Integrar el middleware `persist` de Zustand para guardar `campaignConfig` y proteger el trabajo del usuario.
 * 2. **Uso de Immer para Mutaciones Inmutables**: ((Vigente)) Integrar el middleware `immer` para simplificar las actualizaciones de estado anidado, haciendo el código de las acciones más legible.
 * 3. **Límites de Historial**: ((Vigente)) Añadir lógica para limitar el tamaño de los arrays `pastStates` y `futureStates` para optimizar el uso de memoria en sesiones de edición muy largas.
 */
// lib/builder/core/store.ts
