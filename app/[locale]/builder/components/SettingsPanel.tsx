/* Ruta: app/[locale]/builder/components/SettingsPanel.tsx */

"use client";

import { useBuilderStore } from "../core/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageBlock } from "@/lib/builder/types.d";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SketchPicker, type ColorResult } from "react-color";
import React from "react";

/**
 * @file SettingsPanel.tsx
 * @description Panel de ajustes dinámico.
 * CORRECCIÓN DE TIPOS ESTRICTA: Se han añadido tipos explícitos a todos los
 * manejadores de eventos y a los parámetros de las funciones de renderizado.
 * Esto resuelve todos los errores de 'any' implícito, restaura la seguridad
 * de tipos y mejora la robustez y mantenibilidad del componente.
 *
 * @author Metashark
 * @version 2.2.0 (Full Stability Fix)
 */
const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div
            className="w-4 h-4 rounded-full mr-2 border"
            style={{ backgroundColor: value }}
          />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0">
        <SketchPicker
          color={value}
          onChangeComplete={(color: ColorResult) => onChange(color.hex)}
        />
      </PopoverContent>
    </Popover>
  );
};

export function SettingsPanel() {
  const { selectedBlockId, campaignConfig, updateBlockProp } =
    useBuilderStore();
  const selectedBlock = campaignConfig?.blocks.find(
    (b: PageBlock) => b.id === selectedBlockId
  );

  if (!selectedBlock) {
    return (
      <div className="p-4 text-center">
        <h3 className="font-semibold">Panel de Ajustes</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Selecciona un bloque en el lienzo.
        </p>
      </div>
    );
  }

  const renderPropInput = (key: string, value: any) => {
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    // CORRECCIÓN: Se añade el tipo explícito para el evento del DOM.
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      updateBlockProp(selectedBlock.id, key, e.target.value);
    };

    if (key.toLowerCase().includes("color")) {
      return (
        <div key={key} className="space-y-1">
          <Label>{label}</Label>
          <ColorPicker
            value={String(value)}
            onChange={(color) => updateBlockProp(selectedBlock.id, key, color)}
          />
        </div>
      );
    }

    if (typeof value === "string" && value.length > 50) {
      return (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>{label}</Label>
          <Textarea
            id={key}
            value={value}
            onChange={handleInputChange}
            className="min-h-[100px]"
          />
        </div>
      );
    }

    if (typeof value === "string") {
      return (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="text"
            value={value}
            onChange={handleInputChange}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">
        Editando: <span className="text-primary">{selectedBlock.type}</span>
      </h3>
      {Object.entries(selectedBlock.props).map(([key, value]) =>
        renderPropInput(key, value)
      )}
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Pestañas de "Contenido" vs "Estilo": Para una mejor organización a medida que crecen las opciones, dividir el panel de ajustes en pestañas. Una para el contenido (`props`) y otra para el estilo (`block.styles`), utilizando el componente `<Tabs>` de Shadcn/UI.
 * 2. Componentes de Input Especializados: Expandir `renderPropInput` para manejar más tipos de datos además de strings. Por ejemplo, si una `prop` es de tipo `number`, renderizar un `<Input type="number">`, o si es un booleano, un `<Switch>`.
 * 3. Validación en Tiempo Real con Zod: Integrar Zod en el `onChange` de los inputs para proporcionar validación y feedback de error instantáneo al usuario directamente en el panel (ej. "Debe ser una URL válida").
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Componentes de Input Especializados: Expandir `renderStyleInput` para manejar más tipos de propiedades de CSS de forma nativa, como un slider para `opacity` o un selector con unidades (`px`, `%`, `rem`) para los paddings y márgenes.
 * 2. Validación en Tiempo Real con Zod: Integrar Zod en el `onChange` de los inputs para proporcionar validación y feedback de error instantáneo al usuario directamente en el panel (ej. "El color debe ser un hexadecimal válido").
 * 3. Gestión de Estilos Globales (Tema): Añadir una tercera pestaña "Tema" que permita editar las propiedades de `campaignConfig.theme`. Los cambios aquí (ej. color primario global) se aplicarían a todos los bloques que usen esas variables de tema.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Componentes de Input Especializados: Expandir `renderStyleInput` para manejar más tipos de propiedades de CSS de forma nativa, como un slider para `opacity` o un selector con unidades (`px`, `%`, `rem`) para los paddings y márgenes.
 * 2. Validación en Tiempo Real con Zod: A medida que los inputs se vuelven más complejos (ej. URLs, números), se puede integrar Zod en el `onChange` de los inputs para proporcionar validación y feedback de error instantáneo al usuario directamente en el panel.
 * 3. Gestión de Estilos Globales (Tema): Añadir una tercera pestaña "Tema" que permita editar las propiedades de `campaignConfig.theme`. Los cambios aquí (ej. color primario global) se aplicarían a todos los bloques que usen esas variables de tema.
 * 1. **Componentes de Input Especializados:** Expandir `renderPropInput` para manejar más tipos. Por ejemplo, si una `prop` se llama `backgroundColor`, renderizar un `<Input type="color">`. Si es un texto largo, renderizar un `<Textarea>`. Esto se puede lograr con convenciones de nombres o metadatos en la definición del bloque.
 * 2. **Pestañas de "Contenido" vs "Estilo":** Dividir el panel de ajustes en pestañas. Una para el contenido (las `props` del bloque) y otra para el estilo (las propiedades de `block.styles`). Esto organizaría la UI y la haría más intuitiva a medida que crece el número de opciones de personalización.
 * 3. **Validación en Tiempo Real con Zod:** A medida que los inputs se vuelven más complejos (ej. URLs, números), se puede integrar Zod en el `onChange` para proporcionar validación y feedback de error instantáneo al usuario directamente en el panel de ajustes.
 */
