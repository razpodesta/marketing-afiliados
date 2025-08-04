// components/ui/ConfirmationDialog.tsx
/**
 * @file ConfirmationDialog.tsx
 * @description Componente de UI genérico para confirmación de acciones.
 *              Ha sido refactorizado para una accesibilidad (a11y) completa,
 *              anidando correctamente `DialogHeader` y `DialogFooter` dentro
 *              de `DialogContent` para resolver la advertencia de `aria-describedby`.
 * @author L.I.A Legacy & Raz Podestá
 * @version 4.2.0 (Full Accessibility Compliance)
 */
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

interface ConfirmationDialogProps {
  triggerButton: React.ReactNode;
  icon?: React.ElementType;
  title: string;
  description: React.ReactNode;
  confirmButtonText: string;
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
        {/* --- INICIO DE REFACTORIZACIÓN DE ACCESIBILIDAD --- */}
        {/* La estructura correcta es tener Header y Footer DENTRO de Content. */}
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
                Cancelar
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
        {/* --- FIN DE REFACTORIZACIÓN DE ACCESIBILIDAD --- */}
      </DialogContent>
    </Dialog>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Input de Confirmación**: ((Vigente)) Para acciones de alto riesgo, añadir un campo de texto donde el usuario deba escribir el nombre del recurso para habilitar el botón de confirmación.
 *
 * @subsection Mejoras Implementadas
 * 1. **Accesibilidad (`aria-describedby`)**: ((Implementada)) Se ha reestructurado el componente para anidar `DialogHeader` y `DialogFooter` dentro de `DialogContent`, lo que permite a Radix UI conectar automáticamente la descripción al diálogo y eliminar la advertencia de accesibilidad.
 */
// components/ui/ConfirmationDialog.tsx
