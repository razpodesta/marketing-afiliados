// Ruta: components/sites/CreateSiteForm.tsx
/**
 * @file CreateSiteForm.tsx
 * @description Formulario de cliente para la creación de sitios. Ha sido
 *              refactorizado para una máxima cohesión y seguridad de tipos,
 *              utilizando tipos de entrada y salida explícitos inferidos del
 *              esquema de Zod para un contrato de datos irrompible.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Type-Safe Input/Output Contracts)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CreateSiteSchema } from "@/lib/validators";

import { SubdomainInput } from "./SubdomainInput";

// Se definen tipos explícitos para la entrada (lo que el usuario escribe,
// donde 'name' puede ser opcional) y la salida (los datos después de la validación
// y transformación de Zod, donde 'name' es siempre un string).
type FormInput = z.input<typeof CreateSiteSchema>;
type FormOutput = z.output<typeof CreateSiteSchema>;

/**
 * @interface CreateSiteFormProps
 * @description Define el contrato de props para el formulario.
 */
interface CreateSiteFormProps {
  /**
   * @description La función a ejecutar en un envío exitoso.
   *              Recibe los datos validados y transformados por Zod (`FormOutput`).
   */
  onSubmit: SubmitHandler<FormOutput>;
  /**
   * @description Indica si el proceso de envío está en curso en el componente padre.
   */
  isSubmitting: boolean;
  /**
   * @description El ID del workspace al que se asociará el nuevo sitio.
   */
  workspaceId: string;
}

export function CreateSiteForm({
  onSubmit,
  isSubmitting,
  workspaceId,
}: CreateSiteFormProps) {
  // El hook `useForm` está tipado con `FormInput`, que es el estado que gestiona
  // internamente antes de la validación y transformación.
  const form = useForm<FormInput>({
    resolver: zodResolver(CreateSiteSchema),
    defaultValues: {
      workspaceId,
      icon: "🚀",
      name: "",
      subdomain: "",
      description: "",
    },
    mode: "onBlur", // Validación al salir del campo para una mejor UX
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = form;

  return (
    // La función `handleSubmit` de react-hook-form invoca al `zodResolver`.
    // Procesa los datos de `FormInput`, los transforma a `FormOutput` y luego
    // llama a nuestra prop `onSubmit` con esos datos, cumpliendo así el contrato.
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Sitio</Label>
        <Input
          id="name"
          placeholder="Mi Blog de Afiliados"
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
      </div>

      <div className="space-y-2">
        <Label>Ícono</Label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal bg-input"
                  type="button"
                >
                  <span className="mr-4 text-2xl">{field.value}</span>
                  <span>Seleccionar un ícono</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0">
                <EmojiPicker
                  onEmojiSelect={({ emoji }) => field.onChange(emoji)}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Una breve descripción de tu sitio."
          {...register("description")}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Creando Sitio..." : "Crear Sitio"}
      </Button>
    </form>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `CreateSiteForm.tsx` es un componente de cliente que implementa el
 *               patrón de formulario canónico y robusto de la aplicación.
 *
 * @functionality
 * - **Gestión de Estado con `react-hook-form`:** `useForm` gestiona el estado de los
 *   campos, la validación y los errores, proveyendo un rendimiento optimizado.
 * - **Validación Instantánea con Zod:** El `zodResolver` conecta el `CreateSiteSchema`
 *   con el estado del formulario, proporcionando feedback de validación en tiempo real al
 *   usuario, lo que mejora significativamente la experiencia de usuario.
 * - **Contrato de Tipos Explícito:** La distinción entre `FormInput` (`z.input`) y
 *   `FormOutput` (`z.output`) resuelve la ambigüedad de tipos y crea un contrato de datos
 *   claro y seguro entre el formulario, su lógica de validación y los componentes padre.
 *
 * @relationships
 * - Es un componente hijo de `components/sites/SitesHeader.tsx`.
 * - Consume el componente especializado `SubdomainInput.tsx` para la validación asíncrona.
 * - Su lógica de envío es manejada por el hook `useSitesManagement.ts`, al que notifica a
 *   través de la prop `onSubmit`.
 * - Su validez depende directamente del esquema definido en `lib/validators/index.ts`.
 *
 * @expectations
 * - Se espera que este formulario sea robusto, seguro en tipos y proporcione una experiencia
 *   de usuario sin fricciones. Debe prevenir envíos inválidos con feedback instantáneo y
 *   delegar la lógica de mutación de datos al componente padre, adhiriéndose al principio
 *   de responsabilidad única.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1.  **Estado de Foco Mejorado:** Utilizar `focus-within` en los contenedores de los campos para resaltar visualmente el `Label` y el borde del `Input` cuando el usuario está interactuando con un campo específico, mejorando la guía visual.
 * 2.  **Generación de Nombre Sugerido:** A medida que el usuario escribe el subdominio, se podría sugerir un "Nombre del Sitio" capitalizado y con espacios (ej. "mi-sitio" -> "Mi Sitio") para agilizar el llenado del formulario, siempre que el campo de nombre esté vacío.
 * 3.  **Integración Directa con Server Actions:** Para alinear el formulario con las últimas características de React, se podría migrar de un `onSubmit` prop a usar directamente el hook `useFormState` con la `createSiteAction`. Esto simplificaría el paso de props y centralizaría aún más el estado del formulario.
 */
