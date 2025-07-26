/* Ruta: app/[locale]/builder/components/BlocksPalette.tsx */

"use client";

// CORRECCIÓN: La ruta de importación se ha cambiado de "@/templates" a la correcta.
import { blockRegistry } from "@/components/templates";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

/**
 * @file BlocksPalette.tsx
 * @description Componente que muestra la lista de bloques de construcción disponibles.
 * CORRECCIÓN DE BUILD: Se ha reparado la ruta de importación del `blockRegistry`,
 * resolviendo un error crítico "Module not found" que impedía la compilación
 * y el despliegue de la aplicación.
 *
 * @author Metashark
 * @version 1.1.0 (Build Fix)
 */

/**
 * @description Sub-componente para un único elemento arrastrable en la paleta.
 * @param {{ blockType: string }} props - Propiedades del componente.
 * @returns {JSX.Element}
 */
function PaletteItem({ blockType }: { blockType: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${blockType}`,
    data: { type: blockType, defaultProps: {} },
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

/**
 * @description El componente principal que renderiza la paleta de bloques.
 * @returns {JSX.Element}
 */
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Previsualización de Bloques: En lugar de mostrar solo el nombre del bloque, cada `PaletteItem` podría renderizar una pequeña miniatura o una previsualización visual estática del bloque. Esto mejoraría drásticamente la experiencia de usuario al seleccionar componentes.
 * 2. Organización por Categorías: A medida que el número de bloques crezca, la paleta se volverá difícil de usar. Una mejora crucial sería agrupar los bloques por categorías (ej. "Encabezados", "Héroes", "Contenido", "Pies de página") y presentarlos dentro de un componente `<Accordion>` de Shadcn/UI para mantener la paleta organizada.
 * 3. Búsqueda de Bloques: Añadir un campo de búsqueda en la parte superior de la paleta para permitir a los usuarios filtrar rápidamente los bloques por nombre, una característica de productividad esencial para editores con muchos componentes.
 */
