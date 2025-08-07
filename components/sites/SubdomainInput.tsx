// components/sites/SubdomainInput.tsx
/**
 * @file SubdomainInput.tsx
 * @description Componente de campo de formulario para la validación de subdominios.
 *              Refatorado para ser um componente puro que recebe a mensagem de
 *              erro de internacionalização via props.
 * @author L.I.A. Legacy
 * @version 7.0.0 (Pure I18n Component)
 */
"use client";

import { Check, Loader2, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { useSubdomainAvailability } from "@/lib/hooks/useSubdomainAvailability";
import { rootDomain } from "@/lib/utils";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
interface SubdomainInputProps {
  form: UseFormReturn<any>;
  errorText: string;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

export function SubdomainInput({ form, errorText }: SubdomainInputProps) {
  const {
    register,
    watch,
    formState: { errors, dirtyFields },
  } = form;

  const subdomainValue = watch("subdomain");

  const { availability } = useSubdomainAvailability(
    subdomainValue,
    !!dirtyFields.subdomain,
    !!errors.subdomain
  );

  const renderAvailabilityIcon = () => {
    switch (availability) {
      case "checking":
        return (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        );
      case "available":
        return <Check className="h-4 w-4 text-green-500" />;
      case "unavailable":
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center">
        <div className="relative w-full">
          <Input
            id="subdomain"
            placeholder="tu-sitio-unico"
            className="w-full rounded-r-none focus:z-10 bg-input"
            aria-invalid={!!errors.subdomain}
            {...register("subdomain")}
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {renderAvailabilityIcon()}
          </div>
        </div>
        <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground">
          .{rootDomain}
        </span>
      </div>
      {errors.subdomain && (
        <p className="text-sm text-destructive" role="alert">
          {errors.subdomain.message as string}
        </p>
      )}
      {availability === "unavailable" && !errors.subdomain && (
        <p className="text-sm text-destructive" role="alert">
          {errorText}
        </p>
      )}
    </>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) A mensagem de erro de disponibilidade agora é recebida via props, tornando o componente completamente agnóstico ao conteúdo.
 */
// components/sites/SubdomainInput.tsx
