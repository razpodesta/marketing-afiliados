// components/builder/BuilderHeader.tsx
/**
 * @file BuilderHeader.tsx
 * @description Encabezado del constructor de campañas. Orquesta las acciones de
 *              guardado, la previsualización en diferentes dispositivos, la navegación y,
 *              ahora, el historial de cambios (deshacer/rehacer).
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 3.0.0 (Undo/Redo UI Integration)
 *
 * @see {@link file://./BuilderHeader.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el encabezado del constructor.
 *
 * 1.  **Atajo de Teclado (Ctrl+S / Ctrl+Z):** (Vigente) Implementar listeners de eventos de teclado globales para capturar `Ctrl+S` para guardar, `Ctrl+Z` para deshacer y `Ctrl+Y` para rehacer, una característica estándar en cualquier editor.
 * 2.  **Prevenir Cierre de Pestaña sin Guardar**: (Vigente) Utilizar el evento `beforeunload` del navegador para detectar si hay cambios sin guardar (`isDirty`) y mostrar un diálogo nativo al usuario.
 * 3.  **Guardado Automático (Autosave)**: (Vigente) Implementar una lógica de guardado automático que se dispare cada cierto intervalo de tiempo si hay cambios sin guardar.
 *
 * @section MEJORAS ADICIONADAS
 * @description Nuevas mejoras identificadas durante esta refactorización.
 *
 * 1.  **Tooltips de Accesibilidad**: Añadir componentes `<Tooltip>` a los botones de icono (Undo, Redo, Dispositivos) para mejorar la accesibilidad y la claridad de la interfaz.
 */
"use client";

import {
  CheckCircle,
  Laptop,
  Loader2,
  Redo,
  Save,
  Smartphone,
  Tablet,
  Undo,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { shallow } from "zustand/shallow";

import { useBuilderStore } from "@/lib/builder/core/store";
import { builder as builderActions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function BuilderHeader() {
  const { campaignConfig } = useBuilderStore();

  // Se suscribe a todas las propiedades necesarias usando `shallow` para optimizar re-renders.
  const {
    isSaving,
    setIsSaving,
    devicePreview,
    setDevicePreview,
    pastStates,
    futureStates,
    undo,
    redo,
  } = useBuilderStore(
    (state) => ({
      isSaving: state.isSaving,
      setIsSaving: state.setIsSaving,
      devicePreview: state.devicePreview,
      setDevicePreview: state.setDevicePreview,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
      undo: state.undo,
      redo: state.redo,
    }),
    shallow
  );

  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const [initialState, setInitialState] = useState<string | null>(null);

  useEffect(() => {
    if (campaignConfig) {
      setInitialState(JSON.stringify(campaignConfig));
    }
  }, []); // Solo se ejecuta una vez al montar

  useEffect(() => {
    if (campaignConfig && initialState) {
      const currentState = JSON.stringify(campaignConfig);
      setIsDirty(currentState !== initialState);
    }
  }, [campaignConfig, initialState]);

  const handleSave = () => {
    if (!campaignConfig) return;

    setIsSaving(true);
    startTransition(async () => {
      const result = await builderActions.updateCampaignContentAction(
        campaignConfig.id,
        campaignConfig
      );

      if (result.success) {
        toast.success("¡Campaña guardada con éxito!");
        setInitialState(JSON.stringify(campaignConfig));
        setIsDirty(false);
      } else {
        toast.error(result.error || "Hubo un error al guardar.");
      }
      setIsSaving(false);
    });
  };

  const isLoading = isSaving || isPending;

  const renderSaveButtonContent = () => {
    if (isLoading)
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      );
    if (!isDirty && !isLoading)
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Guardado
        </>
      );
    return (
      <>
        <Save className="mr-2 h-4 w-4" />
        Guardar Cambios
      </>
    );
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shrink-0 relative">
      <div className="w-1/3">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>

      <div className="flex justify-center items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={pastStates.length === 0}
          aria-label="Deshacer"
        >
          <Undo className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={futureStates.length === 0}
          aria-label="Rehacer"
        >
          <Redo className="h-5 w-5" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant={devicePreview === "desktop" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("desktop")}
          aria-label="Vista de Escritorio"
        >
          <Laptop className="h-5 w-5" />
        </Button>
        <Button
          variant={devicePreview === "tablet" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("tablet")}
          aria-label="Vista de Tableta"
        >
          <Tablet className="h-5 w-5" />
        </Button>
        <Button
          variant={devicePreview === "mobile" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("mobile")}
          aria-label="Vista Móvil"
        >
          <Smartphone className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-1/3 flex items-center justify-end gap-2">
        <Button variant="ghost">Previsualizar</Button>
        <Button onClick={handleSave} disabled={isLoading || !isDirty}>
          {renderSaveButtonContent()}
        </Button>
      </div>
    </header>
  );
}
// components/builder/BuilderHeader.tsx
