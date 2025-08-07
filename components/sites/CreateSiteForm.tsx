// components/sites/CreateSiteForm.tsx
/**
 * @file CreateSiteForm.tsx
 * @description Formulario para la creación de nuevos sitios. Refatorado para ser
 *              um componente puro que recebe todos os seus textos via props.
 * @author L.I.A. Legacy
 * @version 8.0.0 (Pure I18n Component)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateSiteClientSchema } from "@/lib/validators";

import { SubdomainInput } from "./SubdomainInput";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
export interface CreateSiteFormTexts {
  nameLabel: string;
  namePlaceholder: string;
  subdomainLabel: string;
  subdomainInUseError: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  creatingButton: string;
  createButton: string;
}

interface CreateSiteFormProps {
  workspaceId: string;
  onSuccess: (formData: FormData) => void;
  isPending: boolean;
  texts: CreateSiteFormTexts;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

type FormInputData = z.infer<typeof CreateSiteClientSchema>;

export function CreateSiteForm({
  workspaceId,
  onSuccess,
  isPending,
  texts,
}: CreateSiteFormProps) {
  const form = useForm<FormInputData>({
    resolver: zodResolver(CreateSiteClientSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      subdomain: "",
      workspaceId: workspaceId,
      description: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const processSubmit: SubmitHandler<FormInputData> = (data) => {
    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("subdomain", data.subdomain);
    formData.append("workspaceId", data.workspaceId);
    formData.append("description", data.description || "");
    onSuccess(formData);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="name">{texts.nameLabel}</Label>
        <Input
          id="name"
          placeholder={texts.namePlaceholder}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">{texts.subdomainLabel}</Label>
        <SubdomainInput form={form} errorText={texts.subdomainInUseError} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{texts.descriptionLabel}</Label>
        <Input
          id="description"
          placeholder={texts.descriptionPlaceholder}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? texts.creatingButton : texts.createButton}
      </Button>
    </form>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) O componente agora é 100% agnóstico ao conteúdo.
 */
// components/sites/CreateSiteForm.tsx
