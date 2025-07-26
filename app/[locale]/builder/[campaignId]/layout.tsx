/* Ruta: app/[locale]/builder/[campaignId]/layout.tsx */

"use client";

import React from "react";
import { SettingsPanel } from "../components/SettingsPanel";
import { BlocksPalette } from "../components/BlocksPalette";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useBuilderStore } from "../core/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutTemplate, Settings } from "lucide-react";
import { BuilderHeader } from "../components/BuilderHeader";

/**
 * @file layout.tsx
 * @description Layout principal del constructor.
 * CORRECCIÓN: Se ha solucionado el error de `startsWith` convirtiendo el `active.id`
 * de tipo `UniqueIdentifier` a `string` antes de la comparación. El componente
 * `Tabs` ahora se importa correctamente.
 *
 * @author Metashark
 * @version 2.2.0 (Logic & Import Fix)
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addBlock, moveBlock } = useBuilderStore();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);

    if (activeId.startsWith("palette-")) {
      const blockType = active.data.current?.type;
      if (blockType)
        addBlock(blockType, active.data.current?.defaultProps || {});
      return;
    }

    if (active.id !== over.id) {
      moveBlock(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen flex-col bg-muted">
        <BuilderHeader />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-96 h-full bg-card border-r flex flex-col">
            <Tabs defaultValue="add" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="add">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Añadir
                </TabsTrigger>
                <TabsTrigger value="edit">
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
    </DndContext>
  );
}
/* Ruta: app/[locale]/builder/[campaignId]/layout.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Sensores de D&D (Accesibilidad y Móvil): Integrar los sensores de `dnd-kit` como `PointerSensor` y `KeyboardSensor`. Esto mejoraría la experiencia en dispositivos táctiles y añadiría accesibilidad, permitiendo a los usuarios reordenar bloques usando el teclado.
 * 2. `DragOverlay` para una Mejor UX: Utilizar el componente `<DragOverlay>` de dnd-kit para renderizar el elemento que se está arrastrando en un portal de React. Esto proporciona una experiencia de arrastre mucho más fluida, sin que el elemento "salte" del DOM, y permite estilizar una vista previa de arrastre perfecta.
 * 3. Deshabilitar Pestaña de Ajustes Contextualmente: La pestaña "Ajustes" podría estar deshabilitada (`<TabsTrigger disabled>`) si no hay ningún bloque seleccionado en el canvas (`selectedBlockId === null`), proporcionando una guía visual más clara al usuario.
 */
