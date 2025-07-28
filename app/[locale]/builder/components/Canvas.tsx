// Ruta: app/[locale]/builder/components/Canvas.tsx
"use client";

import { blockRegistry } from "@/components/templates";
import { PageBlock, type CampaignTheme } from "@/lib/builder/types.d";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { MousePointerSquareDashed } from "lucide-react";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useBuilderStore } from "../core/store";
import { DraggableBlockWrapper } from "./DraggableBlockWrapper";
import type { DevicePreview } from "../core/store";

/**
 * @file Canvas.tsx
 * @description Entorno de Previsualización Aislado y Tematizado para el constructor.
 * REFACTORIZACIÓN DE NIVEL PROFESIONAL:
 * 1.  Implementa la previsualización de dispositivos (escritorio, tablet, móvil)
 *     ajustando dinámicamente el tamaño del iframe.
 * 2.  Inyecta los estilos del tema global (colores) en el `head` del iframe,
 *     permitiendo que los componentes de bloque sean completamente tematizables.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Responsive Preview & Theming)
 */

const IFrame = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: CampaignTheme;
}) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document?.body;
  const headNode = contentRef?.contentWindow?.document?.head;

  const themeCss = useMemo(() => {
    if (!theme.globalColors || Object.keys(theme.globalColors).length === 0) {
      return "";
    }
    const colorVariables = Object.entries(theme.globalColors)
      .map(([name, value]) => `--theme-${name}: ${value};`)
      .join("\n");
    return `:root { ${colorVariables} }`;
  }, [theme.globalColors]);

  return (
    <iframe
      ref={setContentRef}
      className="w-full h-full border-0"
      title="Campaign Preview"
      style={{ backgroundColor: "white" }}
    >
      {headNode &&
        createPortal(
          <>
            <style>{`body { margin: 0; }`}</style>
            <style>{themeCss}</style>
          </>,
          headNode
        )}
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

const EmptyCanvasState = () => (
  <div
    className="flex flex-col items-center justify-center h-full text-center p-8"
    style={{ fontFamily: "sans-serif", color: "#666" }}
  >
    <MousePointerSquareDashed
      className="h-12 w-12 mb-4"
      style={{ color: "#999" }}
    />
    <h3 className="text-lg font-semibold" style={{ color: "#333" }}>
      Lienzo Vacío
    </h3>
    <p className="max-w-xs mt-1">
      Arrastra un bloque desde el panel de la izquierda para empezar a construir
      tu página.
    </p>
  </div>
);

export function Canvas() {
  const { campaignConfig, devicePreview } = useBuilderStore();

  const deviceWidths: Record<DevicePreview, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  if (!campaignConfig) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Cargando configuración...
      </div>
    );
  }

  const { blocks, theme } = campaignConfig;
  const blockIds = blocks.map((b) => b.id);

  const globalStyles: React.CSSProperties = {
    fontFamily: theme.globalFont || "sans-serif",
  };

  return (
    <motion.div
      className="h-full w-full mx-auto transition-all duration-300 ease-in-out"
      animate={{ maxWidth: deviceWidths[devicePreview] }}
    >
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white shadow-inner relative">
        {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
        <div
          data-lia-marker="true"
          className="absolute top-1 left-1 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10"
        >
          Canvas.tsx
        </div>
        <IFrame theme={theme}>
          <div style={globalStyles}>
            {blocks.length === 0 ? (
              <EmptyCanvasState />
            ) : (
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block: PageBlock) => {
                  const BlockComponent = blockRegistry[block.type];
                  if (!BlockComponent) {
                    return (
                      <div
                        key={block.id}
                        style={{
                          padding: "1rem",
                          border: "2px dashed red",
                          color: "red",
                          backgroundColor: "#ffeeee",
                          textAlign: "center",
                          margin: "0.5rem 0",
                        }}
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
            )}
          </div>
        </IFrame>
      </div>
    </motion.div>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Previsualización de Dispositivos: Añadir controles en la UI (en `BuilderHeader`) para cambiar dinámicamente el ancho del `iframe`, simulando cómo se vería la página en dispositivos de escritorio, tablet y móvil.
 * 2. Inyección de Estilos Globales: Extender la funcionalidad del `IFrame` para que acepte una prop con una cadena de CSS. Esto permitiría inyectar las variables de color globales (`theme.globalColors`) en el `head` del iframe, para que los componentes de bloque puedan usarlas.
 * 3. Comunicación Bidireccional con el IFrame: Para funcionalidades avanzadas como la selección de elementos dentro del `iframe` al hacer clic, se necesitaría establecer un sistema de comunicación de mensajes (`postMessage`) entre la ventana principal y el `iframe`.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Renderizado en un `iframe`: Para un aislamiento de estilos perfecto y una previsualización 100% fiel, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario.
 * 2. Previsualización de Dispositivos: Añadir controles en la UI (probablemente en `BuilderHeader`) para cambiar el ancho del contenedor del canvas, simulando cómo se vería la página en dispositivos de escritorio, tablet y móvil.
 * 3. Aplicación de Estilos de Tema Globales: El canvas es el lugar donde se deberían aplicar los estilos globales definidos en `campaignConfig.theme` (como `globalFont`), asegurando que todos los bloques renderizados hereden la tipografía y los colores base de la campaña.
 */
/* 3. Componente de "Estado Vacío": Si la lista `campaignConfig.blocks` está vacía, mostrar un componente amigable que invite al usuario a arrastrar su primer bloque desde la paleta, en lugar de un lienzo en blanco.
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
