// components/builder/BuilderHeader.tsx
"use client";

import { builder as builderActions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/app/[locale]/builder/core/store";
import {
  CheckCircle,
  Laptop,
  Loader2,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { shallow } from "zustand/shallow";

/**
 * @file BuilderHeader.tsx
 * @description Encabezado principal del entorno del constructor.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Architectural Alignment)
 */
export function BuilderHeader() {
  const { campaignConfig } = useBuilderStore();
  const { isSaving, setIsSaving, devicePreview, setDevicePreview } =
    useBuilderStore(
      (state) => ({
        isSaving: state.isSaving,
        setIsSaving: state.setIsSaving,
        devicePreview: state.devicePreview,
        setDevicePreview: state.setDevicePreview,
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
  }, []);

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
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      );
    }
    if (!isDirty && !isLoading) {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Guardado
        </>
      );
    }
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
      <div className="w-1/3 flex justify-center items-center gap-2">
        <Button
          variant={devicePreview === "desktop" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("desktop")}
        >
          <Laptop className="h-5 w-5" />
        </Button>
        <Button
          variant={devicePreview === "tablet" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("tablet")}
        >
          <Tablet className="h-5 w-5" />
        </Button>
        <Button
          variant={devicePreview === "mobile" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setDevicePreview("mobile")}
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Atajo de Teclado (Ctrl+S): Implementar un listener de eventos de teclado global para capturar `Ctrl+S` (o `Cmd+S` en Mac) y que dispare la función `handleSave`, una característica estándar en cualquier editor.
 * 2. Prevenir Cierre de Pestaña sin Guardar: Utilizar el evento `beforeunload` del navegador para detectar si `isDirty` es `true` y, en ese caso, mostrar un diálogo nativo al usuario preguntando si está seguro de que quiere abandonar la página con cambios sin guardar.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Atajo de Teclado (Ctrl+S): Implementar un listener de eventos de teclado global para capturar `Ctrl+S` (o `Cmd+S` en Mac) y que dispare la función `handleSave`, una característica estándar en cualquier editor.
 * 2. Prevenir Cierre de Pestaña sin Guardar: Utilizar el evento `beforeunload` del navegador para detectar si `isDirty` es `true` y, en ese caso, mostrar un diálogo nativo al usuario preguntando si está seguro de que quiere abandonar la página con cambios sin guardar.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Atajo de Teclado (Ctrl+S): Implementar un listener de eventos de teclado global para capturar `Ctrl+S` (o `Cmd+S` en Mac) y que dispare la función `handleSave`, una característica estándar en cualquier editor.
 * 2. Prevenir Cierre de Pestaña sin Guardar: Utilizar el evento `beforeunload` del navegador para detectar si `isDirty` es `true` y, en ese caso, mostrar un diálogo nativo al usuario preguntando si está seguro de que quiere abandonar la página con cambios sin guardar.
 * 3. Guardado Automático (Autosave): Implementar una lógica de guardado automático que se dispare cada cierto intervalo de tiempo (ej. cada 60 segundos) si `isDirty` es `true`, reduciendo aún más el riesgo de pérdida de datos.
 */
