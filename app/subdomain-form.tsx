// app/subdomain-form.tsx
/**
 * @file Tenant Creation Form
 * @description Componente de cliente reutilizable para crear un nuevo tenant (sitio/subdominio).
 * Refactorizado para compatibilidad con React 18 (`useState` + `useTransition`).
 *
 * @author Metashark
 * @version 2.1.0 (React 18 Compatibility)
 */
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
  EmojiPickerFooter,
} from "@/components/ui/emoji-picker";
import { createTenantAction } from "@/app/actions";
import { rootDomain } from "@/lib/utils";

type CreateState = {
  error?: string;
  success?: boolean;
  subdomain?: string;
  icon?: string;
};

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
          className="w-full rounded-r-none focus:z-10"
          required
          aria-describedby="subdomain-error"
        />
        <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-gray-100 px-3 text-gray-500">
          .{rootDomain}
        </span>
      </div>
    </div>
  );
}

function IconPicker({ defaultValue }: { defaultValue?: string }) {
  const t = useTranslations("SubdomainForm");
  const [icon, setIcon] = useState(defaultValue || "");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    setIcon(emoji);
    setIsPickerOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="icon">{t("iconLabel")}</Label>
      <input type="hidden" name="icon" value={icon} required />
      <div className="flex items-center gap-2">
        <Card className="flex flex-1 items-center justify-between rounded-md border border-input p-2">
          <div className="flex min-h-[40px] min-w-[40px] select-none items-center pl-[14px]">
            {icon ? (
              <span className="text-3xl">{icon}</span>
            ) : (
              <span className="text-sm font-normal text-gray-400">
                {t("noIcon")}
              </span>
            )}
          </div>
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto rounded-sm"
              >
                <Smile className="mr-2 h-4 w-4" />
                {t("selectEmoji")}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[256px] p-0"
              align="end"
              sideOffset={5}
            >
              <EmojiPicker
                className="h-[300px] w-[256px]"
                onEmojiSelect={handleEmojiSelect}
              >
                <EmojiPickerSearch />
                <EmojiPickerContent />
                <EmojiPickerFooter />
              </EmojiPicker>
            </PopoverContent>
          </Popover>
        </Card>
      </div>
    </div>
  );
}

export function SubdomainForm() {
  const t = useTranslations("SubdomainForm");
  const [state, setState] = useState<CreateState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTenantAction(state, formData);
      if (result.success) {
        toast.success("¡Sitio creado exitosamente!");
        form.reset(); // Resetea el formulario tras el éxito
      } else {
        // Mantiene los valores en el formulario en caso de error
        setState(result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SubdomainInput defaultValue={state?.subdomain} />
      <IconPicker defaultValue={state?.icon} />
      {state?.error && (
        <p id="subdomain-error" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("creatingButton") : t("createButton")}
      </Button>
    </form>
  );
}
/* MEJORAS PROPUESTAS
 * 1. **Validación en Tiempo Real:** Implementar validación del lado del cliente con una librería como `Zod` y `react-hook-form` para dar feedback instantáneo al usuario (ej. "el subdominio es muy corto") sin esperar a la respuesta del servidor.
 * 2. **Comprobación de Disponibilidad Asíncrona:** Añadir un "debounce" en el campo de subdominio que, tras una pausa en la escritura del usuario, haga una llamada a una Server Action `checkSubdomainAvailability` para verificar si el nombre está disponible, mostrando un tick verde o una cruz roja al lado del campo.
 */
