// Ruta: components/workspaces/CreateWorkspaceForm.tsx
/**
 * @file CreateWorkspaceForm.tsx
 * @description Formulario de cliente para la creación de nuevos workspaces.
 *              Implementa el patrón arquitectónico canónico con `react-hook-form`
 *              y `zodResolver` para una validación instantánea del lado del cliente
 *              y una experiencia de usuario superior.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Canonical Form Pattern)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import { workspaces as workspaceActions } from "@/lib/actions";
import { CreateWorkspaceSchema } from "@/lib/validators";

type FormData = z.infer<typeof CreateWorkspaceSchema>;

export function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: {
      workspaceName: "",
      icon: "🚀",
    },
  });

  const processSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceName", data.workspaceName);
      formData.append("icon", data.icon);

      const result = await workspaceActions.createWorkspaceAction(formData);

      if (result.success) {
        toast.success("¡Workspace creado con éxito!");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 relative">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Nombre del Workspace</Label>
        <Input
          id="workspaceName"
          placeholder="Mi Nuevo Proyecto"
          aria-invalid={errors.workspaceName ? "true" : "false"}
          {...register("workspaceName")}
        />
        {errors.workspaceName && (
          <p className="text-sm text-destructive" role="alert">
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
        {errors.icon && (
          <p className="text-sm text-destructive" role="alert">
            {errors.icon.message}
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
        {isSubmitting || isPending ? "Creando..." : "Crear Workspace"}
      </Button>
    </form>
  );
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar el formulario de creación de workspaces.
 *
 * 1.  **Verificación de Nombre en Tiempo Real:** Implementar una validación asíncrona "debounced" que verifique la disponibilidad del nombre del workspace en tiempo real a medida que el usuario escribe, similar a la validación de subdominios, para prevenir envíos fallidos.
 * 2.  **Plantillas de Workspace:** Permitir al usuario crear un workspace a partir de una plantilla (ej. "Para Agencia", "Para Afiliado Individual"). Esto requeriría una nueva UI en este formulario para seleccionar la plantilla y una lógica expandida en la `createWorkspaceAction` para poblar el nuevo workspace con sitios o campañas de ejemplo.
 * 3.  **Avatares de Workspace Personalizados:** Permitir al usuario subir una imagen como ícono del workspace, además de los emojis. Esto implicaría integrar un componente de subida de archivos, configurar un bucket en Supabase Storage y modificar la Server Action para manejar la subida del archivo y guardar la URL resultante.
 */

/**
 * @fileoverview El aparato `CreateWorkspaceForm.tsx` ha sido refactorizado para implementar el patrón de formulario canónico y robusto de la aplicación.
 * @functionality
 * - **Gestión de Estado con `react-hook-form`:** `useForm` gestiona el estado de los campos, la validación y los errores.
 * - **Validación Instantánea con Zod:** El `zodResolver` conecta el `CreateWorkspaceSchema` con el estado del formulario, proporcionando feedback de validación en tiempo real al usuario mientras escribe, lo que mejora significativamente la experiencia de usuario.
 * - **Control de Componentes Complejos:** El `EmojiPicker` es gestionado a través del componente `<Controller>` de `react-hook-form`, que integra su estado directamente en el formulario sin necesidad de estados locales intermedios, resultando en un código más limpio y una única fuente de verdad.
 * - **Comunicación con Server Action:** La función `handleSubmit` de `react-hook-form` envuelve la lógica de envío, asegurando que la Server Action solo sea invocada si la validación del lado del cliente es exitosa. `useTransition` se utiliza para gestionar el estado de carga de la operación asíncrona.
 * @relationships
 * - Es un componente hijo de `app/[locale]/welcome/page.tsx` y de `components/workspaces/WorkspaceSwitcher.tsx`.
 * - Invoca la Server Action `workspaces.createWorkspaceAction` de `lib/actions/workspaces.actions.ts`.
 * - Utiliza el esquema `CreateWorkspaceSchema` del manifiesto de validadores `lib/validators/index.ts`.
 * @expectations
 * - Se espera que este formulario sea robusto y proporcione una experiencia de usuario clara y sin fricciones. Debe prevenir envíos inválidos con feedback instantáneo y dar una indicación clara del resultado de la operación.
 */
