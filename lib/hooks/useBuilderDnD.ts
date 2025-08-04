// lib/hooks/useBuilderDnD.ts (Nuevo Aparato)
/**
 * @file useBuilderDnD.ts
 * @description Hook de React atómico que encapsula toda la lógica de estado y
 *              eventos para la funcionalidad de arrastrar y soltar (Drag and Drop)
 *              del constructor de campañas.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
"use client";

import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";

import { useBuilderStore } from "@/lib/builder/core/store";

export function useBuilderDnD() {
  const { addBlock, moveBlock } = useBuilderStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isFromPalette = active.data.current?.origin === "palette";

    if (isFromPalette) {
      const blockType = active.data.current?.type;
      if (blockType) {
        addBlock(blockType, active.data.current?.defaultProps || {});
      }
    } else if (active.id !== over.id) {
      moveBlock(String(active.id), String(over.id));
    }
  };

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
  };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Gestos Complejos**: ((Vigente)) Integrar `useSensor(TouchSensor)` para una mejor experiencia en dispositivos táctiles.
 * 2. **Devolución de Estado Adicional**: ((Vigente)) El hook podría devolver un estado `isDragging: boolean` para que la UI pueda reaccionar globalmente.
 */
// lib/hooks/useBuilderDnD.ts
