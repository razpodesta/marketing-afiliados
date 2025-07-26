// NUEVO APARATO: components/workspaces/CreateWorkspaceForm.tsx

"use client";

import { createWorkspaceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

/**
 * @file CreateWorkspaceForm.tsx
 * @description Formulario para la creación de un nuevo workspace.
 * Utiliza las últimas características de React (`useFormState`, `useFormStatus`)
 * para un manejo de estado de formulario moderno y eficiente.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Creando..." : "Crear Workspace"}
    </Button>
  );
}

export function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useFormState(createWorkspaceAction, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success("¡Workspace creado con éxito!");
      onSuccess(); // Cierra el modal en caso de éxito
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Nombre del Workspace</Label>
        <Input
          id="workspaceName"
          name="workspaceName"
          placeholder="Mi Nuevo Proyecto"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
