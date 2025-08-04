// app/[locale]/builder/[campaignId]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout principal del constructor de campañas. Ha sido refactorizado
 *              a un componente de presentación puro, delegando toda su lógica
 *              de interacción al hook `useBuilderDnD`.
 * @author L.I.A Legacy
 * @version 6.0.0 (Atomic Architecture Refactor)
 */
"use client";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { LayoutTemplate, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  BlocksPalette,
  PaletteItemPreview,
} from "@/components/builder/BlocksPalette";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { blockRegistry } from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuilderStore } from "@/lib/builder/core/store";
import { useBuilderDnD } from "@/lib/hooks/useBuilderDnD"; // <-- Importamos el nuevo hook

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedBlockId, campaignConfig } = useBuilderStore();
  const [activeTab, setActiveTab] = useState("add");

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se consume el hook para obtener toda la lógica de D&D.
  const { sensors, activeId, handleDragStart, handleDragEnd } = useBuilderDnD();
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

  useEffect(() => {
    if (!selectedBlockId && activeTab === "edit") {
      setActiveTab("add");
    }
  }, [selectedBlockId, activeTab]);

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
