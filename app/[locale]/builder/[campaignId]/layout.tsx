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
 * MEJORA: Se ha añadido un `BuilderHeader` dedicado para las acciones principales,
 * y se ha reestructurado el layout para usar Flexbox y asegurar que el
 * contenido principal (canvas) ocupe todo el espacio vertical disponible.
 *
 * @author Metashark
 * @version 2.2.0 (Header Integration)
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
