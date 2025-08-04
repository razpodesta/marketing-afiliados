// components/sites/SubdomainInput.tsx
/**
 * @file SubdomainInput.tsx
 * @description Componente de campo de formulario de presentación puro para
 *              la validación de subdominios. Delega toda su lógica de estado
 *              al hook atómico `useSubdomainAvailability`.
 * @author L.I.A. Legacy
 * @version 6.0.0 (Atomic Architecture Refactor)
 * @see {@link file://../../lib/hooks/useSubdomainAvailability.ts} Para la lógica de negocio subyacente.
 */
"use client";

import { Check, Loader2, X } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { useSubdomainAvailability } from "@/lib/hooks/useSubdomainAvailability";
import { rootDomain } from "@/lib/utils";

interface SubdomainInputProps {
  form: UseFormReturn<any>;
}

export function SubdomainInput({ form }: SubdomainInputProps) {
  const {
    register,
    watch,
    formState: { errors, dirtyFields },
  } = form;

  const subdomainValue = watch("subdomain");

  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  // Se consume el nuevo hook para obtener el estado de disponibilidad.
  const { availability } = useSubdomainAvailability(
    subdomainValue,
    !!dirtyFields.subdomain,
    !!errors.subdomain
  );
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

  const renderAvailabilityIcon = () => {
    // La lógica de renderizado permanece, pero ahora depende del estado del hook.
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
          Este subdominio ya está en uso.
        </p>
      )}
    </>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Tipado Estricto de `form` Prop**: ((Vigente)) Tipar la prop `form` con el tipo exacto del formulario padre para máxima seguridad de tipos.
 *
 * @subsection Mejoras Implementadas
 * 1. **Arquitectura Atómica**: ((Implementada)) Toda la lógica de estado y asincronía ha sido extraída al hook reutilizable `useSubdomainAvailability`, haciendo este componente significativamente más simple, declarativo y fácil de mantener.
 */
// components/sites/SubdomainInput.tsx
