/* Ruta: app/[locale]/builder/components/BuilderHeader.tsx */

"use client";

import { Button } from "@/components/ui/button";
import { useBuilderStore } from "../core/store";
import { useTransition } from "react";
import { updateCampaignContentAction } from "@/app/actions";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";

/**
 * @file BuilderHeader.tsx
 * @description Encabezado principal del entorno del constructor.
 * Contiene las acciones clave como "Guardar", "Previsualizar" y "Volver al Dashboard".
 * Gestiona el estado de guardado para proporcionar feedback al usuario.
 *
 * @author Metashark
 * @version 1.0.0
 */
export function BuilderHeader() {
  const { campaignConfig, isSaving, setIsSaving } = useBuilderStore();
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!campaignConfig) return;

    setIsSaving(true);
    startTransition(async () => {
      const result = await updateCampaignContentAction(
        campaignConfig.id,
        campaignConfig
      );
      if (result.success) {
        toast.success("¡Campaña guardada con éxito!");
      } else {
        toast.error(result.error || "Hubo un error al guardar.");
      }
      setIsSaving(false);
    });
  };

  const isLoading = isSaving || isPending;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
      <div className="text-center">
        <h1 className="font-semibold text-lg">
          {campaignConfig?.name || "Cargando..."}
        </h1>
        <p className="text-xs text-muted-foreground">Editor de Campaña</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost">Previsualizar</Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </header>
  );
}
/* Ruta: app/[locale]/builder/components/BuilderHeader.tsx */
