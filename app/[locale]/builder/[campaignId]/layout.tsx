// app/[locale]/builder/[campaignId]/layout.tsx
"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { LayoutTemplate, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  BlocksPalette,
  PaletteItemPreview,
} from "@/components/builder/BlocksPalette";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { Canvas } from "@/components/builder/Canvas"; // Se asegura la importación del Canvas
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { blockRegistry } from "@/components/templates";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useBuilderStore } from "../core/store";

/**
 * @file layout.tsx
 * @description Layout principal del constructor de campañas.
 *              Este componente orquesta la funcionalidad de arrastrar y soltar (Drag & Drop),
 *              la disposición de los paneles laterales (paleta de bloques y ajustes),
 *              y la integración con el estado global del constructor.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Architectural Alignment)
 */
export default function BuilderLayout({
  children, // El Canvas es el children de este layout.
}: {
  children: React.ReactNode;
}) {
  const { addBlock, moveBlock, selectedBlockId, campaignConfig } =
    useBuilderStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeTab, setActiveTab] = useState("add"); // Controla la pestaña activa: 'add' (paleta) o 'edit' (ajustes)

  // Configura los sensores para D&D: Pointer (ratón/táctil) y Keyboard (accesibilidad)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }), // Requiere un arrastre de 10px para activar
    useSensor(KeyboardSensor)
  );

  // Efecto para sincronizar la pestaña de ajustes: si no hay bloque seleccionado, vuelve a la pestaña 'Añadir'.
  useEffect(() => {
    if (!selectedBlockId && activeTab === "edit") {
      setActiveTab("add");
    }
  }, [selectedBlockId, activeTab]);

  // Maneja el inicio de una operación de arrastre.
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Maneja el final de una operación de arrastre.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null); // Resetea el ID del elemento activo después de soltar.

    if (!over) return; // Si no se soltó sobre una zona válida, no hace nada.

    const isFromPalette = active.data.current?.origin === "palette";

    if (isFromPalette) {
      // Si el elemento proviene de la paleta (es un nuevo bloque).
      const blockType = active.data.current?.type;
      if (blockType) {
        addBlock(blockType, active.data.current?.defaultProps || {}); // Añade el bloque al store.
      }
    } else if (active.id !== over.id) {
      // Si el elemento es un bloque existente y se soltó sobre otro bloque (reordenamiento).
      moveBlock(String(active.id), String(over.id)); // Mueve el bloque en el store.
    }
  };

  // Busca el bloque activo (si se está arrastrando un bloque existente del canvas)
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
        <BuilderHeader />{" "}
        {/* Encabezado del constructor (Guardar, Previsualizar) */}
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
                <BlocksPalette /> {/* Panel para añadir nuevos bloques */}
              </TabsContent>
              <TabsContent value="edit" className="flex-1 overflow-y-auto">
                <SettingsPanel />{" "}
                {/* Panel para ajustar el bloque seleccionado */}
              </TabsContent>
            </Tabs>
          </aside>
          <main className="flex-1 h-full overflow-auto">
            {children} {/* Aquí se renderiza el Canvas del constructor */}
          </main>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          isDraggingFromPalette ? (
            // Previsualización cuando se arrastra un elemento desde la paleta
            <PaletteItemPreview
              blockType={String(activeId).replace("palette-", "")}
            />
          ) : activeBlock ? (
            // Previsualización cuando se arrastra un bloque existente del canvas
            React.createElement(
              blockRegistry[activeBlock.type],
              activeBlock.props
            )
          ) : (
            // Fallback si el bloque activo no se encuentra (debería ser raro)
            <Button variant="outline">Elemento Desconocido</Button>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  El aparato `builder/[campaignId]/layout.tsx` es el orquestador principal de la interfaz y la lógica de
 *  interacción del constructor.
 *  1.  **Contexto de D&D (`DndContext`):** Envuelve toda la UI, habilitando la
 *      funcionalidad de arrastrar y soltar en todos sus componentes hijos.
 *      Inicializa los sensores para soportar interacciones de puntero y teclado.
 *  2.  **Gestión de Estado de Arrastre (`activeId`):** Utiliza el estado local `activeId` para
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
 *  5.  **Sincronización de Pestañas (`useEffect`):** El `useEffect` que observa `selectedBlockId`
 *      y `activeTab` asegura que si el usuario deselecciona un bloque, la pestaña
 *      vuelve automáticamente a "Añadir", mejorando la fluidez de la interfaz.
 *
 * @relationships
 * - Es el componente padre de `BuilderHeader.tsx` (encabezado del constructor).
 * - Es el contenedor para el `Canvas.tsx` (el área de diseño de la campaña).
 * - Es el orquestador de los paneles laterales: `BlocksPalette.tsx` (para añadir elementos) y `SettingsPanel.tsx` (para editar elementos).
 * - Consume el estado y las acciones del `useBuilderStore` (`lib/builder/core/store.ts`).
 * - Utiliza primitivos de `@dnd-kit/core` y `@dnd-kit/sortable`.
 *
 * @expectations
 * - Se espera que este layout sea la capa de orquestación de UI de alto nivel para el constructor.
 *   Debe ser eficiente en el manejo de interacciones de arrastrar y soltar, proporcionar una UX fluida,
 *   y delegar la complejidad de la lógica de negocio y la presentación de los elementos al store de Zustand y a sus componentes hijos.
 *   No debe contener lógica de persistencia de datos ni reglas de negocio específicas de un bloque.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Guías Visuales de Inserción (Drop Indicators):** Para una UX de élite, la mejora más significativa es mostrar un indicador visual (una línea o un "espacio fantasma") en el `Canvas` que muestre exactamente dónde se insertará el bloque al soltarlo. Esto requiere implementar estrategias de colisión más avanzadas en `dnd-kit` y renderizar un componente indicador en el `DraggableBlockWrapper` o el `Canvas`.
 * 2.  **Historial de Acciones (Undo/Redo en UI):** Una vez que el middleware `temporal` de Zustand esté integrado en `lib/builder/core/store.ts`, se podrían añadir botones de "Deshacer" y "Rehacer" en el `BuilderHeader` o en este layout. Esto proporcionaría una capacidad crítica para los usuarios de editores profesionales.
 * 3.  **Layout Responsivo del Constructor:** Para mejorar la usabilidad en pantallas más pequeñas (tablets), la barra lateral (`<aside>`) podría convertirse en un componente `<Sheet>` que se despliega desde un lateral. Esto maximizaría el espacio disponible para el `Canvas`, haciendo que la herramienta sea más usable en dispositivos portátiles, y se activaría con un botón en el `BuilderHeader`.
 * 4.  **Optimización del `DragOverlay` para Bloques Complejos:** Aunque `React.createElement` es flexible, para bloques con lógicas de cliente complejas, renderizarlos completamente en el `DragOverlay` puede ser costoso. Se podría considerar una previsualización más ligera (ej. una miniatura o un "esbozo") para el arrastre, o una lógica para renderizar solo los props esenciales.
 */
