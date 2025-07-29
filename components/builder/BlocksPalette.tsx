// Ruta: app/locale/builder/components/BlocksPalette.tsx
"use client";

import { blockRegistry } from "@/components/templates";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

/**
 * @file BlocksPalette.tsx
 * @description Componente que muestra la lista de bloques de construcción disponibles.
 * REFACTORIZACIÓN DE ROBUSTEZ:
 * 1.  El payload de datos de `useDraggable` ahora incluye una propiedad `origin: 'palette'`
 *     para una identificación explícita del origen del arrastre, eliminando la
 *     dependencia de "cadenas mágicas" en el layout.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Robust Drag & Drop Payload)
 */

export function PaletteItemPreview({ blockType }: { blockType: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-grabbing ring-2 ring-primary">
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium text-sm">{blockType}</span>
    </div>
  );
}

function PaletteItem({ blockType }: { blockType: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${blockType}`,
    // REFACTORIZACIÓN: Se añade el origen de los datos de forma explícita.
    data: {
      type: blockType,
      defaultProps: {},
      origin: "palette",
    },
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
    <div className="p-4 space-y-4 relative">
      {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
      <div
        data-lia-marker="true"
        className="absolute top-1 left-1 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10"
      >
        BlocksPalette.tsx
      </div>
      <h3 className="font-bold text-lg border-b pb-2">Bloques</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableBlocks.map((type) => (
          <PaletteItem key={type} blockType={type} />
        ))}
      </div>
    </div>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Previsualización de Bloques: En lugar de mostrar solo el nombre del bloque, cada `PaletteItem` podría renderizar una pequeña miniatura o una previsualización visual estática del bloque. Esto mejoraría drásticamente la experiencia de usuario al seleccionar componentes.
 * 2. Organización por Categorías: A medida que el número de bloques crezca, la paleta se volverá difícil de usar. Una mejora crucial sería agrupar los bloques por categorías (ej. "Encabezados", "Héroes", "Contenido", "Pies de página") y presentarlos dentro de un componente `<Accordion>` de Shadcn/UI para mantener la paleta organizada.
 * 3. Búsqueda de Bloques: Añadir un campo de búsqueda en la parte superior de la paleta para permitir a los usuarios filtrar rápidamente los bloques por nombre, una característica de productividad esencial para editores con muchos componentes.
 */
