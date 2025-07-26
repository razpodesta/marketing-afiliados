/* Ruta: app/[locale]/builder/components/Canvas.tsx */

"use client";

import { PageBlock } from "@/lib/builder/types.d";
// CORRECCIÓN: La ruta de importación se ha corregido para apuntar a la ubicación correcta del registro de bloques.
import { blockRegistry } from "@/components/templates";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilderStore } from "../core/store";
import { DraggableBlockWrapper } from "./DraggableBlockWrapper";

/**
 * @file Canvas.tsx
 * @description El lienzo de previsualización del constructor.
 * CORRECCIÓN DE IMPORTACIÓN: Se ha solucionado un error crítico de resolución de
 * módulo al corregir la ruta de importación para `blockRegistry`. El componente
 * ahora puede localizar y renderizar dinámicamente los bloques de construcción.
 *
 * @author Metashark
 * @version 2.1.0 (Import Path Fix)
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
                className="p-4 my-2 border border-dashed border-destructive text-destructive-foreground bg-destructive/10 rounded-md text-center"
              >
                Error: Bloque desconocido de tipo "{block.type}"
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Renderizado en un `iframe`: Para un aislamiento de estilos perfecto y una previsualización 100% fiel, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario.
 * 2. Previsualización de Dispositivos: Añadir controles en la UI (probablemente en `BuilderHeader`) para cambiar el ancho del contenedor del canvas, simulando cómo se vería la página en dispositivos de escritorio, tablet y móvil.
 * 3. Componente de "Estado Vacío": Si la lista `campaignConfig.blocks` está vacía, mostrar un componente amigable que invite al usuario a arrastrar su primer bloque desde la paleta, en lugar de un lienzo en blanco.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Renderizado en un `iframe`: Para un aislamiento de estilos perfecto y una previsualización 100% fiel, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario.
 * 2. Previsualización de Dispositivos: Añadir controles en la UI (probablemente en `BuilderHeader`) para cambiar el ancho del contenedor del canvas, simulando cómo se vería la página en dispositivos de escritorio, tablet y móvil.
 * 3. Componente de "Estado Vacío": Si la lista `campaignConfig.blocks` está vacía, mostrar un componente amigable que invite al usuario a arrastrar su primer bloque desde la paleta, en lugar de un lienzo en blanco.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Renderizado en un `iframe`: Para un aislamiento de estilos perfecto y una previsualización 100% fiel, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario.
 * 2. Aplicación de Estilos de Bloque: Actualmente, el componente solo pasa las `props` a los bloques, pero parece ignorar la propiedad `block.styles` definida en `lib/builder/types.d.ts`. Esta lógica debería implementarse, probablemente en el `DraggableBlockWrapper`, para aplicar estilos personalizados como padding, márgenes y colores de fondo a cada bloque.
 * 3. Previsualización de Dispositivos: Añadir controles en la UI (probablemente en `BuilderHeader`) para cambiar el ancho del contenedor del canvas, simulando cómo se vería la página en dispositivos de escritorio, tablet y móvil.
 */
/* Ruta: app/[locale]/builder/components/Canvas.tsx
 * 1. **Contenedor de Bloque Interactivo:** Envolver cada `BlockComponent` en un `InteractiveBlockWrapper`. Este wrapper sería responsable de manejar los eventos de `onClick` (para seleccionar el bloque), `onHover` (para mostrar un borde de resaltado), y de ser el `handle` para el drag-and-drop.
 * 2. **Aplicación de Estilos Dinámicos:** El `InteractiveBlockWrapper` también leería la propiedad `block.styles` y la aplicaría como estilos en línea a su contenedor, permitiendo la personalización de padding, márgenes y colores de fondo.
 * 3. **Renderizado en un `iframe`:** Para un aislamiento de estilos perfecto, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario, creando un entorno de previsualización 100% fiel.
 */
