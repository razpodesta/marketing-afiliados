/* Ruta: app/[locale]/builder/components/BlocksPalette.tsx */

"use client";

import { blockRegistry } from "@/templates";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

/**
 * @file BlocksPalette.tsx
 * @description Componente que muestra la lista de bloques de construcción disponibles.
 * Cada bloque es un elemento arrastrable que el usuario puede soltar en el canvas.
 *
 * @author Metashark
 * @version 1.0.0
 */

// Sub-componente para un único elemento arrastrable en la paleta.
function PaletteItem({ blockType }: { blockType: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${blockType}`,
    data: { type: blockType, defaultProps: {} }, // Aquí se podrían poner props por defecto
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium text-sm">{blockType}</span>
    </div>
  );
}

export function BlocksPalette() {
  const availableBlocks = Object.keys(blockRegistry);

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">Bloques</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableBlocks.map((type) => (
          <PaletteItem key={type} blockType={type} />
        ))}
      </div>
    </div>
  );
}
/* Ruta: app/[locale]/builder/components/BlocksPalette.tsx */
