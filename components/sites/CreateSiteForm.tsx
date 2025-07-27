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
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

/**
 * @file CreateSiteForm.tsx
 * @description Componente de cliente para crear un nuevo sitio (subdominio).
 * CORRECCIÓN DE BUILD: Se ha revertido el uso de los hooks experimentales
 * `useActionState` y `useFormStatus` a un patrón más estable con `useState` y
 * `useTransition`. Esto resuelve el error de compilación fatal durante el
 * despliegue en Vercel, garantizando la compatibilidad.
 *
 * @author Metashark
 * @version 4.1.0 (Build Compatibility Fix)
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

export function CreateSiteForm() {
  const t = useTranslations("SubdomainForm");
  const [state, setState] = useState<CreateSiteFormState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createSiteAction({}, formData);
      setState(result);
      if (result.success) {
        toast.success("¡Sitio creado exitosamente!");
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <SubdomainInput defaultValue={state?.subdomain} />
      <IconPicker defaultValue={state?.icon} />
      {state?.error && (
        <p id="subdomain-error" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? t("creatingButton") : t("createButton")}
      </Button>
    </form>
  );
}

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
