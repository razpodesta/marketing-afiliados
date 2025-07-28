// Ruta: components/workspaces/InviteMemberForm.tsx
"use client";

import { InvitationSchema } from "@/app/actions/schemas";
import { sendWorkspaceInvitationAction } from "@/app/actions/workspaces.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

/**
 * @file InviteMemberForm.tsx
 * @description Formulario para invitar a un nuevo miembro a un workspace.
 * REFACTORIZACIÓN ARQUITECTÓNICA Y FUNCIONAL:
 * 1.  Se ha simplificado el manejo de estado al eliminar `useFormState` y
 *     manejar la promesa de la Server Action directamente en `onSubmit`,
 *     alineando el componente con el patrón estándar del proyecto.
 * 2.  Se han añadido nuevos roles ("Editor", "Viewer") al selector para
 *     soportar una gestión de permisos más granular a futuro.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Standardized Architecture & Granular Roles)
 */

type FormData = z.infer<typeof InvitationSchema>;

export function InviteMemberForm({
  workspaceId,
  onSuccess,
}: {
  workspaceId: string;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      workspaceId,
      role: "member",
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("role", data.role);
    formData.append("workspaceId", data.workspaceId);

    const result = await sendWorkspaceInvitationAction(
      { success: false },
      formData
    );

    if (result.success && result.message) {
      toast.success(result.message);
      reset(); // Resetea el formulario a sus valores por defecto
      onSuccess();
    } else if (result.error) {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
      {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
      <div
        data-lia-marker="true"
        className="absolute -top-2 -left-2 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
      >
        InviteMemberForm.tsx
      </div>

      <input type="hidden" {...register("workspaceId")} />

      <div className="space-y-2">
        <Label htmlFor="email">Email del Miembro</Label>
        <Input
          id="email"
          type="email"
          placeholder="colega@ejemplo.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Observador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Enviando Invitación..." : "Enviar Invitación"}
      </Button>
    </form>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato implementa el patrón de formulario estándar de la aplicación.
 *  1.  **Gestión de Estado con `react-hook-form`:** `useForm` gestiona el estado
 *      de los campos, la validación y los errores. El `zodResolver` asegura que
 *      los datos del formulario cumplan con el `InvitationSchema` antes de
 *      permitir el envío.
 *  2.  **Envío Asíncrono:** La función `handleSubmit` de `react-hook-form` envuelve
 *      la lógica de `onSubmit`. `handleSubmit` previene el comportamiento por defecto
 *      del formulario y solo llama a `onSubmit` si la validación del cliente es
 *      exitosa.
 *  3.  **Comunicación con Server Action:** Dentro de `onSubmit`, se gestiona el estado
 *      de carga (`isSubmitting`), se construye el `FormData` y se llama directamente
 *      a la Server Action `sendWorkspaceInvitationAction`. Se maneja la promesa
 *      devuelta para mostrar notificaciones de éxito o error.
 *  4.  **Flujo de UX Post-Envío:** En caso de éxito, se resetea el formulario
 *      con `reset()` de `react-hook-form` para que el usuario pueda enviar otra
 *      invitación, y se llama a `onSuccess` para que el componente padre (el modal)
 *      pueda cerrarse.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Autocompletado de Usuarios Existentes: Para mejorar drásticamente la UX al invitar a usuarios que ya están en la plataforma, el campo de email debería ser reemplazado por un componente de búsqueda con autocompletado. A medida que el usuario escribe, una Server Action `searchUsersByEmail` devolvería una lista de usuarios coincidentes, permitiendo al invitador seleccionarlos visualmente.
 * 2. Invitaciones Múltiples en Lote: Para equipos y agencias, una mejora de productividad clave sería permitir al usuario introducir múltiples correos electrónicos a la vez (ej. en un campo de texto que los convierte en "etiquetas"). La Server Action correspondiente debería ser adaptada para procesar un array de correos y crear las invitaciones en una única transacción de base de datos.
 * 3. Feedback de Invitación en Tiempo Real: Integrar Supabase Realtime para proporcionar feedback instantáneo. Por ejemplo, si el correo introducido ya es miembro del workspace, se podría mostrar un mensaje en tiempo real sin necesidad de enviar el formulario.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Autocompletado de Usuarios Existentes: Para invitar a usuarios que ya están en la plataforma, el campo de email podría ser un campo de búsqueda que consulte la tabla `profiles` y ofrezca autocompletado.
 * 2. Invitaciones Múltiples: Permitir al usuario introducir varias direcciones de correo electrónico (separadas por comas o en un campo de texto que añade "tags") para enviar múltiples invitaciones a la vez.
 * 3. Asignación de Roles más Granular: A medida que la aplicación crezca, se podrían introducir roles más específicos (ej. "Editor", "Analista") y reflejarlos en este selector.
 */
