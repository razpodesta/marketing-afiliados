/* Ruta: components/sites/CreateSiteForm.tsx */

"use client";

import { createSiteAction, type CreateSiteFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { rootDomain } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

/**
 * @file CreateSiteForm.tsx
 * @description Componente de cliente para crear un nuevo sitio (subdominio).
 * REFACTORIZACIÓN A REACT 19: Se ha refactorizado para utilizar los hooks
 * `useFormState` y `useFormStatus`. Esto simplifica enormemente el manejo de
 * estado pendiente, errores y éxito, alineándose con las mejores prácticas
 * modernas de React y Next.js.
 *
 * @author Metashark
 * @version 5.0.0 (React 19 Hooks Refactor)
 */

function SubdomainInput({ defaultValue }: { defaultValue?: string }) {
  const t = useTranslations("SubdomainForm");
  return (
    <div className="space-y-2">
      <Label htmlFor="subdomain">{t("subdomainLabel")}</Label>
      <div className="flex items-center">
        <Input
          id="subdomain"
          name="subdomain"
          placeholder={t("subdomainPlaceholder")}
          defaultValue={defaultValue}
          className="w-full rounded-r-none focus:z-10 bg-input"
          required
          aria-describedby="subdomain-error"
        />
        <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground">
          .{rootDomain}
        </span>
      </div>
    </div>
  );
}

function IconPicker({ defaultValue }: { defaultValue?: string }) {
  const t = useTranslations("SubdomainForm");
  const [icon, setIcon] = useState(defaultValue || "🚀");

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    setIcon(emoji);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="icon">{t("iconLabel")}</Label>
      <input type="hidden" name="icon" value={icon} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start font-normal bg-input"
          >
            <span className="mr-4 text-2xl">{icon}</span>
            <span>{t("selectEmoji")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SubmitButton() {
  const t = useTranslations("SubdomainForm");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? t("creatingButton") : t("createButton")}
    </Button>
  );
}

export function CreateSiteForm() {
  const initialState: CreateSiteFormState = {};
  const [state, formAction] = useFormState(createSiteAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("¡Sitio creado exitosamente!");
      formRef.current?.reset(); // Resetea el formulario en caso de éxito.
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <SubdomainInput defaultValue={state?.subdomain} />
      <IconPicker defaultValue={state?.icon} />
      {state?.error && (
        <p id="subdomain-error" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Validación en Tiempo Real: Implementar validación del lado del cliente con `Zod` y `react-hook-form` para dar feedback instantáneo (ej. "el subdominio es muy corto") sin esperar la respuesta del servidor.
 * 2. Comprobación de Disponibilidad Asíncrona: Añadir un "debounce" en el campo de subdominio que, tras una pausa en la escritura del usuario, llame a una `Server Action` `checkSubdomainAvailability` para verificar si el nombre está disponible, mostrando un tick verde o una cruz roja.
 * 3. Cierre del Modal al Crear: El formulario se usa dentro de un modal (`Dialog`). La prop `onSuccess` que existía en el `CreateWorkspaceForm` debería añadirse aquí para que, en caso de éxito, se pueda cerrar el modal desde el componente padre (`sites-client.tsx`).
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Validación en Tiempo Real: Implementar validación del lado del cliente con `Zod` y `react-hook-form` para dar feedback instantáneo (ej. "el subdominio es muy corto") sin esperar la respuesta del servidor.
 * 2. Comprobación de Disponibilidad Asíncrona: Añadir un "debounce" en el campo de subdominio que, tras una pausa en la escritura del usuario, llame a una `Server Action` `checkSubdomainAvailability` para verificar si el nombre está disponible, mostrando un tick verde o una cruz roja.
 * 3. Reset del Formulario Post-Éxito: Después de una creación exitosa, el formulario podría resetearse. Esto se puede lograr asignando una `key` al formulario que cambie cuando la creación sea exitosa, forzando un re-renderizado del componente con su estado inicial.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Reset de Formulario Post-Éxito:** Investigar el mejor patrón para resetear el formulario
 *    después de una acción exitosa cuando se usa `useActionState`. Una opción es asignar una
 *    `key` al formulario que cambie cuando `state.success` sea `true`.
2.  **Validación en Tiempo Real:** Implementar validación del lado del cliente con `Zod` y `react-hook-form`.
3.  **Comprobación de Disponibilidad Asíncrona:** Añadir un "debounce" en el campo de subdominio para
 *    verificar la disponibilidad del nombre en tiempo real a través de una Server Action dedicada.
 * 1. **Validación en Tiempo Real:** Implementar validación del lado del cliente con `Zod` y `react-hook-form` para dar feedback instantáneo (ej. "el subdominio es muy corto") sin esperar la respuesta del servidor.
 * 2. **Comprobación de Disponibilidad Asíncrona:** Añadir un "debounce" en el campo de subdominio que, tras una pausa en la escritura del usuario, llame a una Server Action `checkSubdomainAvailability` para verificar si el nombre está disponible, mostrando un tick verde o una cruz roja.
 */
