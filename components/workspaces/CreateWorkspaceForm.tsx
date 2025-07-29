// components/workspaces/CreateWorkspaceForm.tsx
"use client";

import { workspaces as workspaceActions } from "@/lib/actions";
import { WorkspaceSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

/**
 * @file CreateWorkspaceForm.tsx
 * @description Formulario para la creación de un nuevo workspace.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Architectural Alignment)
 */

type FormData = z.infer<typeof WorkspaceSchema>;

export function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      workspaceName: "",
      icon: "🚀",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("workspaceName", data.workspaceName);
    formData.append("icon", data.icon);

    const result = await workspaceActions.createWorkspaceAction(
      { error: null, success: false },
      formData
    );

    if (result.success) {
      toast.success("¡Workspace creado con éxito!");
      onSuccess();
    } else if (result.error) {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Nombre del Workspace</Label>
        <Input
          id="workspaceName"
          placeholder="Mi Nuevo Proyecto"
          {...register("workspaceName")}
        />
        {errors.workspaceName && (
          <p className="text-sm text-destructive">
            {errors.workspaceName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Ícono del Workspace</Label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal bg-input"
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
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Creando..." : "Crear Workspace"}
      </Button>
    </form>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Plantillas de Workspace: Permitir al usuario crear un workspace a partir de una plantilla (ej. "Para Agencia"), que podría pre-configurar sitios o campañas iniciales.
 * 2. Avatares de Workspace Personalizados: Permitir al usuario subir una imagen como ícono del workspace, integrando un componente de subida de archivos y Supabase Storage.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha sido refactorizado para utilizar `react-hook-form`, el patrón
 *  estándar de la aplicación para formularios.
 *  1.  **Inicialización del Formulario:** `useForm` se inicializa con un `zodResolver`
 *      que utiliza el `WorkspaceSchema`. Esto conecta la validación de Zod con el
 *      estado del formulario, permitiendo mostrar errores en tiempo real.
 *  2.  **Registro de Inputs:** Los campos de formulario, como el `Input` para el nombre,
 *      se "registran" con el hook usando la función `register`. Esto permite a
 *      `react-hook-form` rastrear su valor y estado de validación.
 *  3.  **Control de Componentes Externos:** El `EmojiPicker` no es un input nativo.
 *      Por lo tanto, se envuelve en el componente `<Controller>`, que actúa como un
 *      puente. El `Controller` le pasa al `EmojiPicker` el valor actual (`field.value`)
 *      y una función `onChange` para notificar a `react-hook-form` de los cambios.
 *  4.  **Manejo del Envío:** El `handleSubmit` de `react-hook-form` envuelve la función
 *      `onSubmit`. `handleSubmit` solo invocará `onSubmit` si la validación de Zod
 *      es exitosa. Dentro de `onSubmit`, se gestiona el estado de carga (`isSubmitting`),
 *      se llama a la Server Action y se maneja la respuesta (mostrando `toast` y
 *      llamando a `onSuccess`).
 *  Este patrón crea formularios robustos, consistentes y con una excelente experiencia
 *  de usuario gracias a la validación instantánea.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Plantillas de Workspace: La mejora de onboarding más significativa sería permitir al usuario crear un workspace a partir de una plantilla (ej. "Para Agencia", "Para Afiliado Individual"). Esto requeriría una nueva UI en este formulario para seleccionar la plantilla y una lógica expandida en la `createWorkspaceAction` para poblar el nuevo workspace con sitios o campañas de ejemplo.
 * 2. Avatares de Workspace Personalizados: Permitir al usuario subir una imagen como ícono del workspace, además de los emojis. Esto implicaría integrar un componente de subida de archivos, configurar un bucket en Supabase Storage y modificar la Server Action para manejar la subida del archivo y guardar la URL resultante.
 * 3. Asignación de Propietario (Contexto de Organización): En un futuro sistema multi-organización, este formulario podría incluir un selector para que un administrador asigne un "propietario" diferente al nuevo workspace, en lugar de asignarlo siempre al usuario que lo crea.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Validación del Lado del Cliente con Zod: Migrar la validación a `react-hook-form` con `zodResolver` para un feedback instantáneo, en lugar de depender únicamente de la validación del servidor.
 * 2. Plantillas de Workspace: Permitir al usuario crear un workspace a partir de una plantilla, lo que podría pre-configurar sitios o campañas iniciales, mejorando el proceso de onboarding.
 * 3. Avatares Personalizados: Además de emojis, permitir la subida de una imagen personalizada como avatar del workspace, guardándola en Supabase Storage.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Validación del Lado del Cliente: Antes de enviar el formulario, se podría usar el schema de Zod correspondiente (importado desde `app/actions/schemas.ts`) para validar la entrada en el cliente, proporcionando feedback instantáneo al usuario.
 * 2. Sugerencias de Nombres: Implementar una lógica que verifique si el nombre del workspace ya existe dentro de la organización del usuario (si aplica) y sugiera alternativas.
 * 3. Plantillas de Workspace: Permitir al usuario crear un workspace a partir de una plantilla, lo que podría pre-configurar sitios o campañas iniciales, mejorando el proceso de onboarding.
 */
