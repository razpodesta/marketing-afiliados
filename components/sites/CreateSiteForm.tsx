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
 * @functionality
 * - **Validación en Tiempo Real:** Utiliza `react-hook-form` con `zodResolver` para proporcionar
 *   feedback de validación instantáneo al usuario, mejorando la UX y previniendo envíos inválidos.
 * - **Verificación Asíncrona:** Se compone con el aparato `SubdomainInput`, que maneja la
 *   verificación de disponibilidad del subdominio en tiempo real de forma asíncrona.
 * - **Estado de Transición:** Emplea `useTransition` de React para gestionar el estado de carga
 *   durante la llamada a la Server Action, deshabilitando el formulario para prevenir envíos duplicados.
 * - **Comunicación por Callbacks:** Es un componente controlado que recibe una prop `onSuccess`,
 *   permitiendo al componente padre reaccionar a la creación exitosa (ej. cerrando un modal).
 *
 * @relationships
 * - Es el componente hijo de `SitesHeader` y es renderizado dentro de un `<Dialog>`.
 * - Utiliza el componente especializado `SubdomainInput` para el campo de subdominio.
 * - Invoca la Server Action `sites.createSiteAction` para la persistencia de datos.
 * - Utiliza el esquema `CreateSiteClientSchema` del manifiesto de validadores.
 *
 * @expectations
 * - Se espera que este componente sea la única interfaz para la creación de sitios. Su lógica debe
 *   permanecer del lado del cliente, centrada en la validación y la experiencia del usuario,
 *   delegando toda la lógica de negocio y seguridad a la Server Action correspondiente.
 *
 * @see {@link file://./CreateSiteForm.test.tsx} Para el arnés de pruebas de integración correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para el formulario de creación de sitios.
 *
 * 1.  **Feedback de Disponibilidad Mejorado**: (Vigente) Además del icono, mostrar un mensaje de texto claro ("Subdominio disponible") para mejorar la accesibilidad y la claridad del feedback en `SubdomainInput`.
 * 2.  **Validación Asíncrona en Zod**: (Vigente) Explorar la capacidad de `zodResolver` para manejar validaciones asíncronas (`.refine(async ...)`). Esto podría simplificar la lógica de `SubdomainInput` al integrar la llamada de disponibilidad directamente en el esquema de validación.
 * 3.  **Gestión de Estado con `useFormState`**: (Vigente) Complementar `react-hook-form` con el hook `useFormState` para mostrar errores devueltos por la Server Action (ej. "Subdominio ya registrado", si ocurre una race condition) directamente en el formulario, asociados al campo correspondiente.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteClientSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
