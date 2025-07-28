// Ruta: lib/hooks/use-command-palette.ts
/**
 * @file use-command-palette.ts
 * @description Store de estado global de Zustand para gestionar la visibilidad
 *              y el comportamiento de la paleta de comandos en toda la aplicación.
 *              Este enfoque desacopla el estado de la paleta de los componentes que
 *              la abren o la utilizan.
 *
 * @author Metashark
 * @version 1.0.0
 */

import { create } from "zustand";

/**
 * @interface CommandPaletteState
 * @description Define la estructura del estado y las acciones para el store de la paleta de comandos.
 */
interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * @const useCommandPaletteStore
 * @description Hook de Zustand que proporciona acceso al estado de la paleta de comandos y a las acciones para manipularlo.
 */
export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
