// components/sites/CreateSiteForm.tsx
/**
 * @file CreateSiteForm.tsx
 * @description Formulario de cliente para la creación de nuevos sitios.
 *              Implementa el patrón arquitectónico canónico con `react-hook-form`
 *              y `zodResolver`, utilizando un esquema de validación específico
 *              para el cliente para una robustez y seguridad de tipos máximas.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 2.0.0 (Client Schema Alignment)
 *
 * @see {@link file://./CreateSiteForm.test.tsx} Para el arnés de pruebas de integración correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para el formulario de creación de sitios.
 *
 * 1.  **Feedback de Disponibilidad Mejorado**: (Vigente) Además del icono, mostrar un mensaje de texto claro ("Subdominio disponible") para mejorar la accesibilidad y la claridad del feedback en `SubdomainInput`.
 * 2.  **Validación Asíncrona en Zod**: (Vigente) Explorar la capacidad de `zodResolver` para manejar validaciones asíncronas (`.refine(async ...)`).
 * 3.  **Gestión de Estado con `useFormState`**: (Vigente) Complementar `react-hook-form` con el hook `useFormState` para mostrar errores devueltos por la Server Action directamente en el formulario.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteClientSchema } from "@/lib/validators";

import { SubdomainInput } from "./SubdomainInput";

type FormInputData = z.infer<typeof CreateSiteClientSchema>;

interface CreateSiteFormProps {
  workspaceId: string;
  onSuccess: () => void;
}

export function CreateSiteForm({
  workspaceId,
  onSuccess,
}: CreateSiteFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInputData>({
    resolver: zodResolver(CreateSiteClientSchema),
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
    reset,
    setValue,
    getValues,
  } = form;

  useEffect(() => {
    if (getValues("workspaceId") !== workspaceId) {
      setValue("workspaceId", workspaceId);
    }
  }, [workspaceId, setValue, getValues]);

  const processSubmit: SubmitHandler<FormInputData> = (data) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("subdomain", data.subdomain);
      formData.append("workspaceId", data.workspaceId);
      formData.append("description", data.description || "");

      const result = await sitesActions.createSiteAction(formData);

      if (result.success) {
        toast.success("¡Sitio creado con éxito!");
        reset();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Sitio (opcional)</Label>
        <Input
          id="name"
          placeholder="Mi Primer Sitio Web"
          aria-invalid={errors.name ? "true" : "false"}
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
        {errors.subdomain && (
          <p
            className="text-sm text-destructive"
            role="alert"
            aria-label="Error de subdominio"
          >
            {errors.subdomain.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Un sitio para mi nueva campaña de afiliados."
          aria-invalid={errors.description ? "true" : "false"}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isPending}
      >
        {(isSubmitting || isPending) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isSubmitting || isPending ? "Creando Sitio..." : "Crear Sitio"}
      </Button>
    </form>
  );
}
// components/sites/CreateSiteForm.tsx
