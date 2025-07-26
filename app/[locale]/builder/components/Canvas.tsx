/* Ruta: app/[locale]/builder/components/Canvas.tsx */

"use client";

import { PageBlock } from "@/lib/builder/types.d";
import { blockRegistry } from "@/templates";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore } from "../core/store";
import { DraggableBlockWrapper } from "./DraggableBlockWrapper";

/**
 * @file Canvas.tsx
 * @description El lienzo de previsualización del constructor.
 * MEJORA: Ahora está envuelto en un `SortableContext` de dnd-kit y utiliza el
 * `DraggableBlockWrapper` para hacer que cada bloque sea reordenable
 * a través de drag-and-drop.
 *
 * @author Metashark
 * @version 2.0.0 (Drag-and-Drop enabled)
 */
export function Canvas() {
  const { campaignConfig } = useBuilderStore();

  if (!campaignConfig) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Cargando configuración...
      </div>
    );
  }

  const blockIds = campaignConfig.blocks.map((b) => b.id);

  return (
    <div className="p-4 bg-white h-full">
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        {campaignConfig.blocks.map((block: PageBlock) => {
          const BlockComponent = blockRegistry[block.type];

          if (!BlockComponent) {
            return (
              <div
                key={block.id}
                className="p-4 bg-destructive text-destructive-foreground"
              >
                Bloque desconocido: {block.type}
              </div>
            );
          }

          return (
            <DraggableBlockWrapper key={block.id} block={block}>
              <BlockComponent {...block.props} />
            </DraggableBlockWrapper>
          );
        })}
      </SortableContext>
    </div>
  );
}
/* Ruta: app/[locale]/builder/components/Canvas.tsx
 * 1. **Contenedor de Bloque Interactivo:** Envolver cada `BlockComponent` en un `InteractiveBlockWrapper`. Este wrapper sería responsable de manejar los eventos de `onClick` (para seleccionar el bloque), `onHover` (para mostrar un borde de resaltado), y de ser el `handle` para el drag-and-drop.
 * 2. **Aplicación de Estilos Dinámicos:** El `InteractiveBlockWrapper` también leería la propiedad `block.styles` y la aplicaría como estilos en línea a su contenedor, permitiendo la personalización de padding, márgenes y colores de fondo.
 * 3. **Renderizado en un `iframe`:** Para un aislamiento de estilos perfecto, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario, creando un entorno de previsualización 100% fiel.
 */
