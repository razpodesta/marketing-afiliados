// components/ui/ConfirmationDialog.tsx
/**
 * @file ConfirmationDialog.tsx
 * @description Componente de UI genérico y reutilizable para confirmación de acciones.
 *              Ha sido refactorizado para usar un manejador `onSubmit` explícito,
 *              garantizando la máxima compatibilidad y testeabilidad en todos los entornos.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.1.0 (Explicit Submit Handler for Testability)
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
  const [isOpen, setIsOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!isPending) {
      setIsOpen(false);
    }
  }, [isPending]);

  // --- INICIO DE CORRECCIÓN ---
  // Se implementa un manejador explícito para el evento `onSubmit`.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario.
    const formData = new FormData(event.currentTarget);
    onConfirm(formData); // Invoca explícitamente la acción pasada por props.
  };
  // --- FIN DE CORRECCIÓN ---

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        {/* El formulario ahora usa `onSubmit` para una máxima compatibilidad. */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-6 w-6 text-destructive" />}
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
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
      </DialogContent>
    </Dialog>
  );
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para evolucionar el componente de diálogo.
 *
 * 1.  **Input de Confirmación Adicional**: (Vigente) Para acciones de altísimo riesgo (ej. eliminar una cuenta), añadir una prop opcional `confirmationText` que renderice un input donde el usuario deba escribir ese texto para habilitar el botón de confirmación.
 * 2.  **Niveles de Severidad**: (Vigente) Introducir una prop `severity: 'danger' | 'warning' | 'info'` que ajuste automáticamente el color del icono y la variante del botón de confirmación, haciendo el componente aún más declarativo.
 * 3.  **Callbacks de Éxito/Error**: (Vigente) Añadir props opcionales `onSuccess` y `onError` que puedan ser llamadas desde la Server Action. Esto requeriría que el componente use `useFormState` internamente para una gestión de estado más avanzada.
 */
// components/ui/ConfirmationDialog.tsx
