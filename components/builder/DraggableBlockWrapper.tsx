// Ruta: components/builder/DraggableBlockWrapper.tsx
/**
 * @file components/builder/DraggableBlockWrapper.tsx
 * @description Componente HOC que envuelve cada bloque en el canvas,
 *              proporcionando interactividad, drag-and-drop y acciones contextuales.
 *              Refactorizado para una total conformidad con los estándares de accesibilidad (a11y).
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 5.2.0 (Full Accessibility Compliance)
 */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  MoreVertical,
  Trash2,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBuilderStore } from "@/lib/builder/core/store";
import { type PageBlock } from "@/lib/builder/types.d";
import { cn } from "@/lib/utils";

export function DraggableBlockWrapper({
  block,
  children,
}: {
  block: PageBlock;
  children: React.ReactNode;
}) {
  const {
    selectedBlockId,
    setSelectedBlockId,
    deleteBlock,
    duplicateBlock,
    moveBlockByStep,
    campaignConfig,
  } = useBuilderStore();

  const isSelected = block.id === selectedBlockId;
  const blockIndex =
    campaignConfig?.blocks.findIndex((b) => b.id === block.id) ?? -1;
  const totalBlocks = campaignConfig?.blocks.length ?? 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const dndStyles: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const userDefinedStyles: React.CSSProperties = {
    backgroundColor: block.styles.backgroundColor,
    color: block.styles.textColor,
    paddingTop: block.styles.paddingTop,
    paddingBottom: block.styles.paddingBottom,
    marginTop: block.styles.marginTop,
    marginBottom: block.styles.marginBottom,
  };

  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent): void => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...dndStyles, ...userDefinedStyles }}
      onClick={() => setSelectedBlockId(block.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedBlockId(block.id);
        }
      }}
      role="button"
      aria-label={`Bloque de tipo ${block.type}`}
      tabIndex={0}
      className={cn(
        "relative group p-1 transition-shadow focus:outline-none focus:ring-2 focus:ring-primary",
        isSelected &&
          "ring-2 ring-primary ring-offset-background z-10 rounded-lg shadow-lg"
      )}
    >
      <div
        data-lia-marker="true"
        className="absolute -top-1.5 -left-2 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        DraggableBlockWrapper.tsx
      </div>

      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1",
          isSelected && "opacity-100"
        )}
      >
        {/* CORRECCIÓN (a11y): Se añade `tabIndex` y `onKeyDown` para cumplir
            totalmente el contrato de un elemento interactivo con `role="button"`.
            Esto resuelve los errores `interactive-supports-focus` y `click-events-have-key-events`. */}
        <div
          {...attributes}
          {...listeners}
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
          role="button"
          tabIndex={0}
          aria-label="Arrastrar para reordenar"
          className="p-2 cursor-grab active:cursor-grabbing bg-card rounded-md border"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div
        className={cn(
          "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20",
          isSelected && "opacity-100"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7"
              aria-label="Opciones del bloque"
              onClick={stopPropagation}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onSelect={() => moveBlockByStep(block.id, "up")}
              disabled={blockIndex === 0}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              <span>Mover Arriba</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => moveBlockByStep(block.id, "down")}
              disabled={blockIndex === totalBlocks - 1}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              <span>Mover Abajo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => duplicateBlock(block.id)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => deleteBlock(block.id)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={cn(isSelected && "pointer-events-none")}>{children}</div>
    </div>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato actúa como una capa de control interactiva sobre cada bloque
 *  visual del constructor. Su lógica principal es mediar entre las acciones del
 *  usuario y el store de estado central (`useBuilderStore`).
 *  1.  **Conexión con el Store:** Obtiene el estado (`selectedBlockId`, `campaignConfig`) y las acciones (`setSelectedBlockId`, `deleteBlock`, etc.) del store de Zustand.
 *  2.  **Lógica de Selección:** Al hacer clic en el contenedor principal, llama a `setSelectedBlockId(block.id)`, lo que actualiza el estado global y provoca que el `SettingsPanel` muestre las opciones de este bloque.
 *  3.  **Habilitación de D&D:** Utiliza el hook `useSortable` de `dnd-kit`. Los `attributes` y `listeners` que devuelve se aplican al "handle" (icono de agarre), indicando a `dnd-kit` que el arrastre solo debe iniciarse desde ese elemento específico. Los estilos de `transform` se aplican al contenedor principal para mover visualmente el bloque durante el arrastre.
 *  4.  **Acciones Contextuales:** El `DropdownMenu` contiene ítems que, al ser seleccionados (`onSelect`), llaman a las acciones correspondientes del store (ej. `duplicateBlock(block.id)`).
 *  5.  **Lógica de Deshabilitación Condicional (Mejora):** Se calcula el índice del bloque actual (`blockIndex`) y el total de bloques. Esta información se usa para deshabilitar las acciones "Mover Arriba" (si `blockIndex === 0`) y "Mover Abajo" (si es el último), previniendo acciones inválidas y mejorando la UX.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Edición de Texto en Línea (Inline Editing): Implementar una lógica que, al hacer doble clic, active un "modo de edición" para los componentes de texto. Esto requeriría una comunicación compleja con el `iframe` del `Canvas` (probablemente usando `postMessage`) para eliminar `pointer-events-none` y añadir `contentEditable=true` a los elementos de texto, lo que representa la siguiente frontera en la productividad del editor.
 * 2. "Guardar como Bloque Reutilizable": Añadir una nueva acción al menú contextual que guarde las `props` y `styles` del bloque actual en una tabla `reusable_blocks` en la base de datos, asociada al workspace. Esto permitiría a los usuarios crear su propia biblioteca de componentes personalizados para reinsertarlos más tarde desde la `BlocksPalette`.
 * 3. Indicadores de Arrastre Visuales (Drop Indicators): Mejorar la experiencia de D&D renderizando una línea o un "espacio fantasma" cuando un bloque se arrastra sobre este. Esto se puede lograr detectando el estado `isOver` del hook `useSortable` y renderizando condicionalmente un elemento visual para indicar la posición de inserción.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Edición de Texto en Línea: Para componentes de texto, se podría implementar una lógica que, al hacer doble clic, elimine `pointer-events-none` y añada `contentEditable=true` al elemento de texto, permitiendo una edición rápida directamente en el canvas.
 * 2. "Guardar como Bloque Reutilizable": Añadir una nueva acción al menú contextual que guarde las `props` y `styles` del bloque actual en una tabla `reusable_blocks` en la base de datos, asociada al workspace, para que pueda ser reinsertado más tarde desde la paleta.
 * 3. Acciones de Mover Arriba/Abajo: Añadir botones de flecha en el menú contextual para mover un bloque una posición hacia arriba o hacia abajo en el array, ofreciendo una alternativa de reordenamiento más precisa que el drag-and-drop.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones Contextuales Expandidas: Además de eliminar, el menú contextual podría expandirse para incluir acciones como "Duplicar Bloque", "Guardar como Reutilizable" o "Mover Arriba/Abajo", lo que mejoraría enormemente la productividad del editor.
 * 2. Previsualización de Arrastre Mejorada: Utilizar `DragOverlay` de dnd-kit para mostrar una "captura" visual del componente mientras se arrastra, en lugar de solo reducir su opacidad. Esto proporciona una experiencia de usuario mucho más pulida.
 * 3. Edición de Texto en Línea: Para componentes de texto, se podría implementar una lógica que, al hacer doble clic, elimine `pointer-events-none` y añada `contentEditable=true` al elemento de texto, permitiendo una edición rápida directamente en el canvas.
 */
