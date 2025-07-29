// Ruta: components/builder/Canvas.tsx
/**
 * @file Canvas.tsx
 * @description Entorno de Previsualización Aislado y Tematizado para el constructor.
 *              Actúa como el lienzo principal donde los usuarios ven y manipulan los bloques de su campaña.
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 5.2.5 (Definitive Linting Fix - Verification Protocol)
 */
"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { MousePointerSquareDashed } from "lucide-react";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { blockRegistry } from "@/components/templates";
import { type DevicePreview, useBuilderStore } from "@/lib/builder/core/store";
import { type CampaignTheme, type PageBlock } from "@/lib/builder/types.d";

import { DraggableBlockWrapper } from "./DraggableBlockWrapper";

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
  const blockIds = blocks.map((b: PageBlock) => b.id);

  const globalStyles: React.CSSProperties = {
    fontFamily: theme.globalFont || "sans-serif",
  };

  return (
    <motion.div
      className="h-full w-full mx-auto transition-all duration-300 ease-in-out"
      animate={{ maxWidth: deviceWidths[devicePreview] }}
    >
      <div className="h-full w-full overflow-hidden rounded-lg border bg-white shadow-inner relative">
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
                        {/* CORRECCIÓN DEFINITIVA: Se escapan las comillas para cumplir la regla `react/no-unescaped-entities`. */}
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
/* Ruta: app/[locale]/builder/components/Canvas.tsx
 * 1. **Contenedor de Bloque Interactivo:** Envolver cada `BlockComponent` en un `InteractiveBlockWrapper`. Este wrapper sería responsable de manejar los eventos de `onClick` (para seleccionar el bloque), `onHover` (para mostrar un borde de resaltado), y de ser el `handle` para el drag-and-drop.
 * 2. **Aplicación de Estilos Dinámicos:** El `InteractiveBlockWrapper` también leería la propiedad `block.styles` y la aplicaría como estilos en línea a su contenedor, permitiendo la personalización de padding, márgenes y colores de fondo.
 * 3. **Renderizado en un `iframe`:** Para un aislamiento de estilos perfecto, el canvas podría renderizar el contenido dentro de un `iframe` con `srcDoc`. Esto previene que los estilos del editor (panel de ajustes, etc.) se filtren y afecten a la previsualización de la página del usuario, creando un entorno de previsualización 100% fiel.
 */
