// components/campaigns/CreateCampaignForm.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * @file CreateCampaignForm.tsx
 * @description Formulario de presentación puro para la creación de nuevas campañas,
 *              ahora completamente internacionalizado.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Full Internationalization)
 */
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
  const t = useTranslations("CampaignsPage");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="space-y-2">
        <Label htmlFor="name">{t("form_name_label")}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t("form_name_placeholder")}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? t("form_creating_button") : t("form_create_button")}
      </Button>
    </form>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Internacionalización Completa**: ((Implementada)) Todos los textos del formulario ahora se obtienen del `namespace` `CampaignsPage`, eliminando el contenido codificado en duro.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación con `react-hook-form`**: ((Vigente)) Migrar este formulario al patrón canónico con `react-hook-form` y `zodResolver` para proporcionar validación del lado del cliente en tiempo real.
 */
// components/campaigns/CreateCampaignForm.tsx
