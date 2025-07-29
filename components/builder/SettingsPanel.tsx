// Ruta: app/locale/builder/components/SettingsPanel.tsx
"use client";

import React from "react";
import { type ColorResult, SketchPicker } from "react-color";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageBlock } from "@/lib/builder/types.d";

import { useBuilderStore } from "../core/store";

/**
 * @file SettingsPanel.tsx
 * @description Panel de ajustes dinámico y contextual para los bloques del constructor.
 * REFACTORIZACIÓN ARQUITECTÓNICA:
 * 1.  El panel ahora está organizado en pestañas ("Contenido" y "Estilo") para
 *     una mejor separación de responsabilidades y una UX más limpia.
 * 2.  Se ha implementado un sistema de "registro de inputs" para renderizar
 *     controles de UI especializados basados en convenciones de nombres o tipos de datos,
 *     haciendo el componente más escalable y mantenible.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Tabbed & Registry-Based Architecture)
 */

// --- Componentes de Input Especializados ---

const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start">
        <div
          className="w-4 h-4 rounded-full mr-2 border"
          style={{ backgroundColor: value }}
        />
        {value || "No establecido"}
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

const TextInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => <Input type="text" value={value} onChange={onChange} />;

const TextAreaInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => <Textarea value={value} onChange={onChange} className="min-h-[100px]" />;

const BooleanSwitch = ({
  value,
  onCheckedChange,
}: {
  value: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => <Switch checked={value} onCheckedChange={onCheckedChange} />;

// --- Lógica de Renderizado y Registros ---

const renderField = (
  key: string,
  value: any,
  blockId: string,
  updateFn: (blockId: string, key: string, value: any) => void
) => {
  const label = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

  // --- Registro de Inputs (Basado en convención y tipo) ---
  const getInputComponent = () => {
    if (key.toLowerCase().includes("color")) {
      return (
        <ColorPicker
          value={String(value)}
          onChange={(color) => updateFn(blockId, key, color)}
        />
      );
    }
    if (typeof value === "boolean") {
      return (
        <BooleanSwitch
          value={value}
          onCheckedChange={(checked) => updateFn(blockId, key, checked)}
        />
      );
    }
    if (typeof value === "string" && value.length > 60) {
      return (
        <TextAreaInput
          value={value}
          onChange={(e) => updateFn(blockId, key, e.target.value)}
        />
      );
    }
    if (typeof value === "string") {
      return (
        <TextInput
          value={value}
          onChange={(e) => updateFn(blockId, key, e.target.value)}
        />
      );
    }
    return (
      <p className="text-xs text-muted-foreground">
        Tipo de propiedad no soportado.
      </p>
    );
  };

  return (
    <div key={key} className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      {getInputComponent()}
    </div>
  );
};

export function SettingsPanel() {
  const { selectedBlockId, campaignConfig, updateBlockProp, updateBlockStyle } =
    useBuilderStore();
  const selectedBlock = campaignConfig?.blocks.find(
    (b: PageBlock) => b.id === selectedBlockId
  );

  if (!selectedBlock) {
    return (
      <div className="p-4 text-center relative">
        <div
          data-lia-marker="true"
          className="absolute top-1 left-1 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
        >
          SettingsPanel.tsx
        </div>
        <h3 className="font-semibold">Panel de Ajustes</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Selecciona un bloque en el lienzo para ver sus opciones.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 relative">
      <div
        data-lia-marker="true"
        className="absolute top-1 left-1 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
      >
        SettingsPanel.tsx
      </div>
      <h3 className="font-bold text-lg border-b pb-2">
        Editando: <span className="text-primary">{selectedBlock.type}</span>
      </h3>
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-4 pt-4">
          {Object.entries(selectedBlock.props).map(([key, value]) =>
            renderField(key, value, selectedBlock.id, updateBlockProp)
          )}
        </TabsContent>
        <TabsContent value="style" className="space-y-4 pt-4">
          {Object.entries(selectedBlock.styles).map(([key, value]) =>
            renderField(key, value, selectedBlock.id, updateBlockStyle)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato funciona como un generador de formularios dinámico y contextual.
 *  1.  **Selección de Contexto:** Primero, obtiene el `selectedBlock` desde el store
 *      de Zustand. Si no hay ninguno, muestra un estado vacío.
 *  2.  **Organización por Pestañas:** Utiliza el componente `<Tabs>` para separar
 *      la edición de las propiedades de "Contenido" (`block.props`) de las de
 *      "Estilo" (`block.styles`). Esto mejora drásticamente la organización y la UX.
 *  3.  **Renderizado Basado en Registro:** Para cada pestaña, itera sobre las claves
 *      y valores del objeto correspondiente (`props` o `styles`). La función
 *      `renderField` actúa como un despachador. Dentro de `getInputComponent`, una
 *      lógica de "registro" (una serie de condiciones `if`) determina qué componente
 *      de input especializado (`ColorPicker`, `BooleanSwitch`, `TextInput`, etc.)
 *      debe renderizarse basado en el nombre de la clave o el tipo de dato del valor.
 *  4.  **Actualización de Estado Centralizada:** Cada componente de input, al cambiar,
 *      invoca la función `updateFn` correspondiente (`updateBlockProp` o `updateBlockStyle`).
 *      Esta acción actualiza el estado en el store de Zustand, lo que a su vez
 *      provoca que el `Canvas` se re-renderice con los nuevos datos, creando un
 *      flujo de datos unidireccional y reactivo.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Esquema de Edición Declarativo: Para desacoplar completamente el `SettingsPanel` de los bloques, la mejora arquitectónica definitiva es que cada bloque defina su propio "esquema de edición" en el `blockRegistry`. Este esquema declararía explícitamente qué control de UI usar para cada prop (ej. `{ prop: 'title', control: 'text' }`). El `SettingsPanel` simplemente leería este esquema y generaría el formulario, eliminando la necesidad de la lógica de inferencia `getInputComponent`.
 * 2. Validación de Datos en el Store: Antes de actualizar el estado, la acción `updateBlockProp` en el store de Zustand podría validar el nuevo valor contra un esquema de Zod asociado al bloque. Si la validación falla, podría almacenar un mensaje de error en el store, que el `SettingsPanel` podría entonces mostrar junto al campo correspondiente, proporcionando un feedback de validación robusto.
 * 3. Gestión de Estilos Globales (Tema): Añadir una tercera pestaña "Tema" que se active cuando *ningún* bloque esté seleccionado. Esta pestaña permitiría editar las propiedades de `campaignConfig.theme` (como el color primario global o la fuente). Los cambios aquí se aplicarían a todos los bloques que usen esas variables de tema, proporcionando un control de diseño global.
 */
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
