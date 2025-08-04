// components/sites/CreateSiteForm.tsx
/**
 * @file CreateSiteForm.tsx
 * @description Formulario para la creación de nuevos sitios. Ha sido refactorizado
 *              para que su callback `onSuccess` pase el FormData, delegando la
 *              invocación de la Server Action a su componente padre.
 * @author L.I.A. Legacy
 * @version 6.0.0 (Callback Contract Alignment)
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

type FormInputData = z.infer<typeof CreateSiteClientSchema>;

interface CreateSiteFormProps {
  workspaceId: string;
  // --- INICIO DE REFACTORIZACIÓN DE CONTRATO ---
  // El callback ahora pasa los datos del formulario.
  onSuccess: (formData: FormData) => void;
  isPending: boolean; // El estado de carga viene de fuera.
  // --- FIN DE REFACTORIZACIÓN DE CONTRATO ---
}

export function CreateSiteForm({
  workspaceId,
  onSuccess,
  isPending,
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
    onSuccess(formData); // Llama al callback con los datos.
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del sitio</Label>
        <Input
          id="name"
          placeholder="Mi Primer Sitio Web"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">Subdominio</Label>
        <SubdomainInput form={form} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Un sitio para mi nueva campaña de afiliados."
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
        {isLoading ? "Creando Sitio..." : "Crear Sitio"}
      </Button>
    </form>
  );
}
