// Ruta: app/locale/builder/core/store.ts
import { arrayMove } from "@dnd-kit/sortable";
import { create, type StateCreator } from "zustand";

import { type CampaignConfig, type PageBlock } from "@/lib/builder/types.d";

/**
 * @file store.ts
 * @description Almacén de estado global de Zustand para el constructor.
 * REFACTORIZACIÓN DE FUNCIONALIDAD:
 * 1.  Se ha añadido la acción `moveBlockByStep` para permitir el reordenamiento
 *     preciso de bloques (mover arriba/abajo) desde la UI.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Precise Block Movement)
 */

export type DevicePreview = "desktop" | "tablet" | "mobile";

interface BuilderState {
  campaignConfig: CampaignConfig | null;
  selectedBlockId: string | null;
  isSaving: boolean;
  devicePreview: DevicePreview;
  setCampaignConfig: (config: CampaignConfig) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  updateBlockProp: (blockId: string, propName: string, value: any) => void;
  updateBlockStyle: (blockId: string, styleName: string, value: string) => void;
  addBlock: (blockType: string, defaultProps: Record<string, any>) => void;
  moveBlock: (activeId: string, overId: string) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setDevicePreview: (device: DevicePreview) => void;
  moveBlockByStep: (blockId: string, direction: "up" | "down") => void; // <-- NUEVA ACCIÓN
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

export const useBuilderStore = create<BuilderState>(createBuilderSlice);
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es el cerebro de estado del constructor. Utiliza Zustand, una
 *  librería de gestión de estado minimalista, para crear un store centralizado.
 *  1.  **Estado Único:** Define una única "slice" de estado (`BuilderState`) que contiene toda la información necesaria para el constructor: la configuración de la campaña, el bloque seleccionado, estados de UI como `isSaving` y el nuevo `devicePreview`.
 *  2.  **Acciones Puras:** Las funciones como `updateBlockProp` o `addBlock` son acciones que reciben el estado actual (`state`) y devuelven un nuevo objeto de estado. Son funciones puras que describen cómo debe cambiar el estado de forma inmutable.
 *  3.  **Desacoplamiento:** Al centralizar el estado aquí, los componentes de React se vuelven más simples. En lugar de pasar props a través de múltiples niveles, cualquier componente del constructor puede "suscribirse" al store con el hook `useBuilderStore` y acceder tanto al estado como a las acciones que necesita.
 *  4.  **Hidratación en Servidor:** Este store está diseñado para ser "hidratado" en el `page.tsx` del servidor, lo que significa que su estado inicial se establece en el servidor y se pasa al cliente, evitando cargas de datos adicionales en el navegador.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Middleware de Persistencia en `localStorage`: Integrar el middleware `persist` de Zustand para guardar automáticamente el estado del constructor (especialmente `campaignConfig`) en el `localStorage` del navegador. Esto protegería el trabajo del usuario contra cierres accidentales de la pestaña o fallos del navegador, permitiéndole retomar su trabajo exactamente donde lo dejó.
 * 2. Middleware de Historial (Undo/Redo): Utilizar el middleware `temporal` de Zustand para implementar un historial de cambios. Esto permitiría a los usuarios deshacer y rehacer acciones con `Ctrl+Z` y `Ctrl+Y`, una característica fundamental en cualquier editor de nivel profesional, con una implementación mínima en el store.
 * 3. Uso de Immer para Mutaciones Inmutables: Integrar el middleware `immer` de Zustand para simplificar drásticamente las acciones que modifican estados anidados, como `updateBlockProp`. Permitiría escribir código que "muta" el estado de forma más directa y legible, mientras Immer se encarga de la inmutabilidad por debajo.
 */
/*
 * 1. **Middleware de Persistencia en `localStorage`:** Integrar el middleware `persist` de Zustand para guardar automáticamente el estado del constructor en el `localStorage` del navegador. Esto protegería el trabajo del usuario contra cierres accidentales de la pestaña o crashes del navegador.
 * 2. **Historial de Deshacer/Rehacer (Undo/Redo):** Utilizar el middleware `temporal` de Zustand para implementar fácilmente un historial de cambios. Esto permitiría a los usuarios deshacer y rehacer acciones con `Ctrl+Z` y `Ctrl+Y`, una característica fundamental en cualquier editor serio.
 * 3. **Acciones para Manipulación de la Estructura:** Añadir más acciones al store para manejar la lógica de drag-and-drop, como `addBlock(block, index)`, `moveBlock(fromIndex, toIndex)` y `deleteBlock(blockId)`. Esto mantendrá toda la lógica de manipulación del estado centralizada aquí.
 * 1. **Uso de Immer para Mutaciones Inmutables:** Actualizar arrays y objetos anidados de forma inmutable puede ser verboso. Integrar el middleware `immer` de Zustand simplificaría drásticamente las acciones como `updateBlockProp`, permitiendo escribir código que "muta" el estado de forma segura.
 * 2. **Acciones de Copiar/Pegar Bloques:** Añadir acciones `copyBlock(blockId)` y `pasteBlock(index)` al store. Esto permitiría a los usuarios duplicar bloques complejos rápidamente, una característica de productividad muy potente.
 * 3. **Estado de "Guardado":** Añadir una propiedad `isDirty: boolean` al store. Se pondría en `true` cada vez que se modifica la configuración y en `false` después de guardar. Esto permite a la UI mostrar un indicador de "cambios sin guardar" y prevenir que el usuario cierre la pestaña sin guardar.
 */
