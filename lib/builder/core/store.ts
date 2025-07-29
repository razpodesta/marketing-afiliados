/**
 * @file lib/builder/core/store.ts
 * @description Almacén de estado global de Zustand para el constructor.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.2.0 (Type-Safe Actions)
 */
import { type CampaignConfig, type PageBlock } from "@/lib/builder/types.d";
import { arrayMove } from "@dnd-kit/sortable";
import { create, type StateCreator } from "zustand";

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
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
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
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
      };
    }),

  updateBlockStyle: (blockId, styleName, value) =>
    set((state) => {
      if (!state.campaignConfig) return {};
      const newBlocks = state.campaignConfig.blocks.map((block) =>
        block.id === blockId
          ? { ...block, styles: { ...block.styles, [styleName]: value } }
          : block
      );
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
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
      return {
        campaignConfig: { ...state.campaignConfig, blocks: newBlocks },
      };
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

export const useBuilderStore = create<BuilderState>(createBuilderSlice);
