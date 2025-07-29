// app/[locale]/builder/[campaignId]/layout.tsx
"use client";

import {
  BlocksPalette,
  PaletteItemPreview,
} from "@/components/builder/BlocksPalette";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { blockRegistry } from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { LayoutTemplate, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBuilderStore } from "../core/store";

/**
 * @file layout.tsx
 * @description Layout principal del constructor.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Architectural Alignment)
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addBlock, moveBlock, selectedBlockId, campaignConfig } =
    useBuilderStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeTab, setActiveTab] = useState("add");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!selectedBlockId && activeTab === "edit") {
      setActiveTab("add");
    }
  }, [selectedBlockId, activeTab]);

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

  const activeBlock =
    activeId && campaignConfig?.blocks.find((b) => b.id === activeId);
  const isDraggingFromPalette =
    activeId && String(activeId).startsWith("palette-");

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-screen flex-col bg-muted relative">
        <BuilderHeader />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-96 h-full bg-card border-r flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="add">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Añadir
                </TabsTrigger>
                <TabsTrigger value="edit" disabled={!selectedBlockId}>
                  <Settings className="w-4 h-4 mr-2" />
                  Ajustes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="add" className="flex-1 overflow-y-auto">
                <BlocksPalette />
              </TabsContent>
              <TabsContent value="edit" className="flex-1 overflow-y-auto">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </aside>
          <main className="flex-1 h-full overflow-auto">{children}</main>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          isDraggingFromPalette ? (
            <PaletteItemPreview
              blockType={String(activeId).replace("palette-", "")}
            />
          ) : activeBlock ? (
            React.createElement(
              blockRegistry[activeBlock.type],
              activeBlock.props
            )
          ) : (
            <Button variant="outline">Elemento Desconocido</Button>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es el orquestador principal de la interfaz y la lógica de
 *  interacción del constructor.
 *  1.  **Contexto de D&D:** `DndContext` envuelve toda la UI, habilitando la
 *      funcionalidad de arrastrar y soltar en todos sus componentes hijos.
 *      Inicializa los sensores para soportar interacciones de puntero y teclado.
 *  2.  **Gestión de Estado de Arrastre:** Utiliza el estado local `activeId` para
 *      rastrear qué elemento se está arrastrando actualmente. El evento `onDragStart`
 *      establece este ID.
 *  3.  **Lógica de Finalización de Arrastre (`handleDragEnd`):** Este es el núcleo
 *      de la interacción. Al soltar un elemento, esta función determina el origen
 *      del arrastre.
 *      - **Desde la Paleta:** Si `event.active.data.current?.origin` es 'palette',
 *        interpreta que es un nuevo bloque y llama a la acción `addBlock` del store.
 *      - **Reordenamiento:** Si el origen no es la paleta y el bloque se ha soltado
 *        sobre un bloque diferente (`active.id !== over.id`), interpreta que es una
 *        acción de reordenamiento y llama a `moveBlock` en el store.
 *  4.  **Previsualización Visual (`DragOverlay`):** Mientras un elemento está
 *      siendo arrastrado (`activeId` no es nulo), este componente renderiza una
 *      previsualización flotante. Muestra un componente `PaletteItemPreview` si
 *      el origen es la paleta, o una réplica del componente real (`activeBlock`)
 *      si se está reordenando un bloque existente, proporcionando una UX fluida.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Guías Visuales de Inserción (Drop Indicators): Para una UX de élite, la mejora más significativa es mostrar un indicador visual (una línea o un "espacio fantasma") en el `Canvas` que muestre exactamente dónde se insertará el bloque al soltarlo. Esto requiere implementar estrategias de colisión más avanzadas en `dnd-kit` y renderizar un componente indicador en el `DraggableBlockWrapper`.
 * 2. Historial de Acciones (Undo/Redo): Integrar un sistema de historial de deshacer/rehacer. Antes de llamar a las acciones del store (`addBlock`, `moveBlock`), se podría guardar el estado actual de `campaignConfig` en una pila. Esto permitiría implementar atajos como `Ctrl+Z`, una característica fundamental en cualquier editor de nivel profesional.
 * 3. Layout Responsivo del Constructor: Para mejorar la usabilidad en pantallas más pequeñas, la barra lateral (`<aside>`) podría convertirse en un componente `<Sheet>` que se despliega desde un lateral. Esto maximizaría el espacio disponible para el `Canvas`, haciendo que la herramienta sea más usable en dispositivos como tablets.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Estrategia de Colisión de D&D: La estrategia por defecto de `dnd-kit` es funcional, pero se podría mejorar la UX implementando estrategias más sofisticadas como `closestCenter` o `rectIntersection`, o incluso una estrategia personalizada que muestre una línea de inserción donde el bloque será soltado.
 * 2. Integración con Historial Undo/Redo: Este layout es el lugar ideal para integrar un sistema de historial de deshacer/rehacer. Antes de llamar a las acciones del store como `addBlock` o `moveBlock`, se podría guardar el estado actual en una pila de historial, permitiendo al usuario revertir cambios con `Ctrl+Z`.
 * 3. Layout de Constructor Responsivo: Para mejorar la usabilidad en pantallas más pequeñas, la barra lateral podría convertirse en un componente `<Sheet>` que se despliegue desde un lateral, en lugar de ser un panel fijo, maximizando el espacio disponible para el lienzo.
 */
/* Ruta: app/[locale]/builder/[campaignId]/layout.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Sensores de D&D (Accesibilidad y Móvil): Integrar los sensores de `dnd-kit` como `PointerSensor` y `KeyboardSensor`. Esto mejoraría la experiencia en dispositivos táctiles y añadiría accesibilidad, permitiendo a los usuarios reordenar bloques usando el teclado.
 * 2. `DragOverlay` para una Mejor UX: Utilizar el componente `<DragOverlay>` de dnd-kit para renderizar el elemento que se está arrastrando en un portal de React. Esto proporciona una experiencia de arrastre mucho más fluida, sin que el elemento "salte" del DOM, y permite estilizar una vista previa de arrastre perfecta.
 * 3. Deshabilitar Pestaña de Ajustes Contextualmente: La pestaña "Ajustes" podría estar deshabilitada (`<TabsTrigger disabled>`) si no hay ningún bloque seleccionado en el canvas (`selectedBlockId === null`), proporcionando una guía visual más clara al usuario.
 */
