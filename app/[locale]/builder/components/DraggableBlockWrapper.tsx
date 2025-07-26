/* Ruta: app/[locale]/builder/components/DraggableBlockWrapper.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { PageBlock } from "@/lib/builder/types.d";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import React from "react";
import { useBuilderStore } from "../core/store";

/**
 * @file DraggableBlockWrapper.tsx
 * @description Componente HOC que envuelve cada bloque en el canvas.
 * MEJORA FUNCIONAL: Ahora lee y aplica la propiedad `block.styles` para
 * permitir la personalización visual de cada bloque (padding, colores, etc.),
 * conectando el panel de ajustes con la previsualización del canvas.
 *
 * @author Metashark
 * @version 2.0.0 (Dynamic Styling Implementation)
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

  // Estilos para la transformación de D&D
  const dndStyles = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  // Estilos personalizados definidos por el usuario en el SettingsPanel
  const userDefinedStyles = {
    backgroundColor: block.styles.backgroundColor,
    color: block.styles.textColor,
    paddingTop: block.styles.paddingTop,
    paddingBottom: block.styles.paddingBottom,
    marginTop: block.styles.marginTop,
    marginBottom: block.styles.marginBottom,
  };

  return (
    <div
      ref={setNodeRef}
      // Se combinan ambos conjuntos de estilos
      style={{ ...dndStyles, ...userDefinedStyles }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBlockId(block.id);
      }}
      className={cn(
        "relative group p-1 transition-shadow", // Se añade transition-shadow
        isSelected &&
          "ring-2 ring-primary ring-offset-background z-10 rounded-lg shadow-lg"
      )}
    >
      {/* Handle de Arrastre */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 cursor-grab bg-card rounded-md border",
          isSelected && "opacity-100"
        )}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Botón de Eliminar */}
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

      {/* Contenido del Bloque */}
      <div className={cn(isSelected && "pointer-events-none")}>{children}</div>
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones Contextuales Expandidas: Además de eliminar, el menú contextual podría expandirse para incluir acciones como "Duplicar Bloque", "Guardar como Reutilizable" o "Mover Arriba/Abajo", lo que mejoraría enormemente la productividad del editor.
 * 2. Previsualización de Arrastre Mejorada: Utilizar `DragOverlay` de dnd-kit para mostrar una "captura" visual del componente mientras se arrastra, en lugar de solo reducir su opacidad. Esto proporciona una experiencia de usuario mucho más pulida.
 * 3. Edición de Texto en Línea: Para componentes de texto, se podría implementar una lógica que, al hacer doble clic, elimine `pointer-events-none` y añada `contentEditable=true` al elemento de texto, permitiendo una edición rápida directamente en el canvas.
 */
