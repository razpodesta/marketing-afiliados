// components/ui/ConfirmationDialog.tsx
"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * @file ConfirmationDialog.tsx
 * @description Componente de UI genérico y puro para confirmación de acciones.
 *              Ahora es completamente agnóstico al contenido, recibiendo todos
 *              sus textos a través de props para una internacionalización total.
 * @author L.I.A Legacy & Raz Podestá
 * @version 5.0.0 (Full Internationalization via Props)
 */
interface ConfirmationDialogProps {
  triggerButton: React.ReactNode;
  icon?: React.ElementType;
  title: string;
  description: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: string; // <-- NUEVA PROP
  confirmButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
  onConfirm: (formData: FormData) => void;
  isPending: boolean;
  hiddenInputs?: Record<string, string>;
}

export function ConfirmationDialog({
  triggerButton,
  icon: Icon,
  title,
  description,
  confirmButtonText,
  cancelButtonText, // <-- NUEVA PROP
  confirmButtonVariant = "destructive",
  onConfirm,
  isPending,
  hiddenInputs,
}: ConfirmationDialogProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onConfirm(formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-6 w-6 text-destructive" />}
              {title}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {cancelButtonText}
              </Button>
            </DialogClose>
            {hiddenInputs &&
              Object.entries(hiddenInputs).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            <Button
              variant={confirmButtonVariant}
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Contrato de Contenido Explícito**: ((Implementada)) Se ha añadido la prop `cancelButtonText`, haciendo que el componente sea 100% controlable y agnóstico al contenido, cumpliendo con el mandato de internacionalización.
 *
 * @subsection Melhorias Futuras
 * 1. **Input de Confirmación**: ((Vigente)) Para acciones de alto riesgo, añadir un campo de texto donde el usuario deba escribir el nombre del recurso para habilitar el botón de confirmación.
 */
// components/ui/ConfirmationDialog.tsx
