// components/campaigns/CreateCampaignForm.tsx
/**
 * @file CreateCampaignForm.tsx
 * @description Formulario de presentación puro para la creación de nuevas campañas.
 *              Este aparato ha sido refactorizado para ser un componente completamente
 *              controlado, recibiendo su estado de carga (`isPending`) y su manejador
 *              de envío (`onSubmit`) como props, eliminando toda lógica de estado interna.
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 4.0.0 (Pure Presentational Component)
 *
 * @see {@link file://./CreateCampaignForm.test.tsx} Para el arnés de pruebas correspondiente.
 */
"use client";

import { Loader2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCampaignFormProps {
  siteId: string;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}

export function CreateCampaignForm({
  siteId,
  onSubmit,
  isPending,
}: CreateCampaignFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Campaña</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: Lanzamiento Producto X"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Creando Campaña..." : "Crear Campaña"}
      </Button>
    </form>
  );
}
// components/campaigns/CreateCampaignForm.tsx
