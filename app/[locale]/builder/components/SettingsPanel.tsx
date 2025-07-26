/* Ruta: app/[locale]/builder/components/SettingsPanel.tsx */

"use client";

import { useBuilderStore } from "../core/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageBlock } from "@/lib/builder/types.d";
import { Textarea } from "@/components/ui/textarea"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SketchPicker, type ColorResult } from "react-color";
import React from "react";

/**
 * @file SettingsPanel.tsx
 * @description Panel de ajustes dinámico.
 * CORRECCIÓN: Se han solucionado los errores de importación al añadir el componente `Textarea`
 * y los tipos para `react-color`. Se ha añadido tipado explícito al manejador `onChange` del
 * input de texto para eliminar el error de `any` implícito.
 *
 * @author Metashark
 * @version 2.1.0 (Dependency & Typing Fix)
 */
const ColorPicker = ({ value, onChange }: { value: string, onChange: (color: string) => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: value }} />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0">
        <SketchPicker color={value} onChangeComplete={(color: ColorResult) => onChange(color.hex)} />
      </PopoverContent>
    </Popover>
  );
};

export function SettingsPanel() {
  const { selectedBlockId, campaignConfig, updateBlockProp } = useBuilderStore();
  const selectedBlock = campaignConfig?.blocks.find((b: PageBlock) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="p-4 text-center">
        <h3 className="font-semibold">Panel de Ajustes</h3>
        <p className="text-sm text-muted-foreground mt-2">Selecciona un bloque en el lienzo.</p>
      </div>
    );
  }

  const renderPropInput = (key: string, value: any) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateBlockProp(selectedBlock.id, key, e.target.value);
    };

    if (key.toLowerCase().includes("color")) {
      return (
        <div key={key} className="space-y-1">
          <Label>{label}</Label>
          <ColorPicker value={String(value)} onChange={(color) => updateBlockProp(selectedBlock.id, key, color)} />
        </div>
      );
    }
    
    if (typeof value === 'string' && value.length > 50) {
       return (
          <div key={key} className="space-y-1">
            <Label htmlFor={key}>{label}</Label>
            <Textarea id={key} value={value} onChange={handleInputChange} className="min-h-[100px]" />
          </div>
        );
    }
    
    switch (typeof value) {
      case 'string':
        return (
          <div key={key} className="space-y-1">
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} type="text" value={value} onChange={handleInputChange} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-lg border-b pb-2">Editando: <span className="text-primary">{selectedBlock.type}</span></h3>
      {Object.entries(selectedBlock.props).map(([key, value]) => renderPropInput(key, value))}
    </div>
  );
}
/* Ruta: app/[locale]/builder/components/SettingsPanel.tsx
 * 1. **Componentes de Input Especializados:** Expandir `renderPropInput` para manejar más tipos. Por ejemplo, si una `prop` se llama `backgroundColor`, renderizar un `<Input type="color">`. Si es un texto largo, renderizar un `<Textarea>`. Esto se puede lograr con convenciones de nombres o metadatos en la definición del bloque.
 * 2. **Pestañas de "Contenido" vs "Estilo":** Dividir el panel de ajustes en pestañas. Una para el contenido (las `props` del bloque) y otra para el estilo (las propiedades de `block.styles`). Esto organizaría la UI y la haría más intuitiva a medida que crece el número de opciones de personalización.
 * 3. **Validación en Tiempo Real con Zod:** A medida que los inputs se vuelven más complejos (ej. URLs, números), se puede integrar Zod en el `onChange` para proporcionar validación y feedback de error instantáneo al usuario directamente en el panel de ajustes.
 */
