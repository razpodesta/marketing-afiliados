// Ruta: components/workspaces/InviteMemberForm.tsx
/**
 * @file InviteMemberForm.tsx
 * @description Formulario para invitar a un nuevo miembro a un workspace. Ha sido
 *              refactorizado para alinearse con el patrón arquitectónico canónico
 *              de `react-hook-form`, proporcionando validación en tiempo real.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Canonical Form Pattern Alignment)
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";

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
import { workspaces as workspaceActions } from "@/lib/actions";
import { InvitationSchema } from "@/lib/validators";

type FormData = z.infer<typeof InvitationSchema>;

export function InviteMemberForm({
  workspaceId,
  onSuccess,
}: {
  workspaceId: string;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      workspaceId,
      role: "member",
      email: "",
    },
  });

  const processSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("role", data.role);
      formData.append("workspaceId", data.workspaceId);

      const result =
        await workspaceActions.sendWorkspaceInvitationAction(formData);

      if (result.success) {
        toast.success(result.data.message);
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
        <Label htmlFor="email">Email del Miembro</Label>
        <Input
          id="email"
          type="email"
          placeholder="colega@ejemplo.com"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                id="role"
                aria-invalid={errors.role ? "true" : "false"}
              >
                <SelectValue placeholder="Seleccionar un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-sm text-destructive" role="alert">
            {errors.role.message}
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
        {isSubmitting || isPending
          ? "Enviando Invitación..."
          : "Enviar Invitación"}
      </Button>
    </form>
  );
}
