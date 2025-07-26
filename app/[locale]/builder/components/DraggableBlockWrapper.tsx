/* Ruta: app/[locale]/builder/components/DraggableBlockWrapper.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { PageBlock } from "@/lib/builder/types.d";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"; // <-- CORRECCIÓN: Importación ahora válida
import { GripVertical, Trash2 } from "lucide-react";
import React from "react";
import { useBuilderStore } from "../core/store";

/**
 * @file DraggableBlockWrapper.tsx
 * @description Componente de orden superior (HOC) que envuelve cada bloque en el canvas.
 * Le proporciona funcionalidades de arrastrar y soltar, selección y acciones contextuales.
 * CORRECCIÓN: Se ha solucionado el error de importación al instalar `@dnd-kit/utilities`.
 *
 * @author Metashark
 * @version 1.1.0 (Dependency Fix)
 */
export function DraggableBlockWrapper({
  block,
  children,
}: {
  block: PageBlock;
  children: React.ReactNode;
}) {
  const { selectedBlockId, setSelectedBlockId, deleteBlock } =
    useBuilderStore();
  const isSelected = block.id === selectedBlockId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBlockId(block.id);
      }}
      className={cn(
        "relative group p-1",
        isSelected &&
          "ring-2 ring-primary ring-offset-background z-10 rounded-lg"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 cursor-grab",
          isSelected && "opacity-100"
        )}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div
        className={cn(
          "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20",
          isSelected && "opacity-100"
        )}
      >
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            deleteBlock(block.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn(isSelected && "pointer-events-none")}>{children}</div>
    </div>
  );
}
/* Ruta: app/[locale]/builder/components/DraggableBlockWrapper.tsx */
