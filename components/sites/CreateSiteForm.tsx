// Ruta: components/sites/CreateSiteForm.tsx
/**
 * @file CreateSiteForm.tsx
 * @description Formulario de cliente para la creación de nuevos sitios.
 *              Implementa el patrón arquitectónico canónico con `react-hook-form`
 *              y `zodResolver` para una validación instantánea del lado del cliente
 *              y una experiencia de usuario superior. Se integra con `SubdomainInput`.
 *              La funcionalidad de selección de iconos ha sido eliminada para simplificar
 *              el formulario y el modelo de datos, centrándose en la información esencial.
 *              Las dependencias de tipo y la construcción de `FormData` se han refinado
 *              para una compatibilidad total con el esquema Zod actualizado.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 1.5.0 (Type Consistency & FormData Construction Fix)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
// Importaciones cruciales para un tipado robusto con react-hook-form
import { useForm, UseFormReturn, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sites as sitesActions } from "@/lib/actions";
import { CreateSiteSchema } from "@/lib/validators";

import { SubdomainInput } from "./SubdomainInput"; // Componente especializado para subdominio

// Define el tipo de datos del formulario *después* de la validación y transformación de Zod.
// Esto es lo que `handleSubmit` le pasará a `processSubmit`.
type FormInputData = z.infer<typeof CreateSiteSchema>;

/**
 * @interface CreateSiteFormProps
 * @description Define las propiedades que acepta el componente `CreateSiteForm`.
 * @property {string} workspaceId - El ID del workspace al que se asociará el nuevo sitio.
 * @property {() => void} onSuccess - Función de callback que se ejecuta tras un envío exitoso del formulario.
 */
interface CreateSiteFormProps {
  workspaceId: string;
  onSuccess: () => void;
}

/**
 * @function CreateSiteForm
 * @description Componente de formulario para crear un nuevo sitio.
 *              Proporciona validación en tiempo real y gestiona el envío a una Server Action.
 * @param {CreateSiteFormProps} { workspaceId, onSuccess } - Propiedades del componente.
 * @returns {JSX.Element} El formulario de creación de sitio.
 */
export function CreateSiteForm({
  workspaceId,
  onSuccess,
}: CreateSiteFormProps) {
  const [isPending, startTransition] = useTransition();

  // Se tipa explícitamente el hook `useForm` con `FormInputData`.
  // Esto asegura que el formulario opere con el contrato de tipos definido por `CreateSiteSchema`.
  const form: UseFormReturn<FormInputData> = useForm<FormInputData>({
    resolver: zodResolver(CreateSiteSchema),
    // Aseguramos que los valores por defecto para campos opcionales sean cadenas vacías,
    // lo cual es consistente con cómo Zod los transformará (con .default("")) en el esquema.
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
    control, // `control` es necesario para `Controller` si se usara para otros campos complejos.
    // Aquí se usa indirectamente por `SubdomainInput` que recibe la instancia `form` completa.
    formState: { errors, isSubmitting },
    reset,
    getValues,
    setValue,
  } = form; // Se desestructura `form` para que la instancia completa esté disponible.

  // Sincroniza el `workspaceId` de las props con el estado del formulario.
  // Utiliza `setValue` para evitar un reseteo completo y preservar otros campos.
  useEffect(() => {
    // Solo actualiza si el `workspaceId` de las props difiere del valor actual del formulario.
    if (getValues("workspaceId") !== workspaceId) {
      setValue("workspaceId", workspaceId);
    }
  }, [workspaceId, setValue, getValues]); // Dependencias del efecto.

  /**
   * @async
   * @function processSubmit
   * @description Maneja el envío del formulario. Se ejecuta solo si la validación en cliente es exitosa.
   *              Envía los datos a la Server Action `sitesActions.createSiteAction`.
   * @param {FormInputData} data - Los datos del formulario ya validados y transformados por Zod.
   */
  const processSubmit: SubmitHandler<FormInputData> = (data) => {
    startTransition(async () => {
      // Construye un objeto FormData nativo para la Server Action
      // utilizando los datos *ya validados y transformados* por `react-hook-form`.
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("subdomain", data.subdomain);
      formDataToSend.append("workspaceId", data.workspaceId);

      // `data.description` ya es un `string` (vacío si no se introdujo) gracias a `.default("")` en Zod.
      // No se necesita `|| ""` ni comprobación de `undefined`/`null` aquí.
      formDataToSend.append("description", data.description);

      const result = await sitesActions.createSiteAction(formDataToSend);

      if (result.success) {
        toast.success("¡Sitio creado con éxito!");
        reset(); // Reinicia el formulario a sus valores por defecto
        onSuccess(); // Llama al callback del componente padre (ej. para cerrar un modal)
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      {/* Campo oculto para workspaceId, gestionado por react-hook-form */}
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Sitio</Label>
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
        {/* Se pasa la instancia *completa* de `form` (el resultado de `useForm`) a `SubdomainInput`.
            Esto permite a `SubdomainInput` acceder a métodos como `watch` y `register` internamente. */}
        <SubdomainInput form={form} />
        {/* Muestra los errores de validación del esquema Zod para el subdominio */}
        {errors.subdomain && (
          <p className="text-sm text-destructive" role="alert">
            {errors.subdomain.message}
          </p>
        )}
      </div>

      {/* La sección de selección de ícono ha sido removida por solicitud. */}

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

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Manejo de Errores de Validación de Zod en UI más granular:** Aunque `errors.fieldName.message` ya muestra el error, para una UX aún más rica, se podría implementar una función `mapZodErrorToUI` que interprete errores más complejos de Zod (ej. de `.superRefine` o uniones) y los muestre de forma más amigable o detallada bajo el campo correcto.
 * 2.  **Animaciones de Transición de Formulario:** Usar `framer-motion` para animaciones sutiles en la aparición/desaparición de mensajes de error o en la transición del estado del botón de envío (`Crear Sitio` a `Creando...`), mejorando la fluidez visual.
 * 3.  **Generación de `slug` sugerido en tiempo real:** Si el campo `name` tiene la lógica de generar un `slug` por defecto (como en `CreateCampaignSchema.transform()`), se podría mostrar una previsualización de este `slug` bajo el campo `subdomain` a medida que el usuario escribe el nombre, como una guía.
 * 4.  **Confirmación con `Dialog` para Cierre con Cambios Sin Guardar:** Si se convierte este formulario en uno de edición (o si se introduce un estado 'dirty'), se podría usar un `useBeforeUnload` (o similar) para mostrar un modal de confirmación antes de que el usuario cierre la ventana con cambios sin guardar.
 */
