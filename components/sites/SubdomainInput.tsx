// Ruta: components/sites/SubdomainInput.tsx
/**
 * @file SubdomainInput.tsx
 * @description Componente de campo de formulario especializado y autocontenido para
 *              la validación de subdominios. Encapsula la lógica de debounce y la
 *              verificación asíncrona en tiempo real contra el servidor.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
"use client";

import { Check, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { sites as sitesActions } from "@/lib/actions";
import { debounce, rootDomain } from "@/lib/utils";

type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable";

interface SubdomainInputProps {
  form: UseFormReturn<any>;
}

export function SubdomainInput({ form }: SubdomainInputProps) {
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const {
    register,
    watch,
    formState: { errors, dirtyFields },
  } = form;

  const subdomainValue = watch("subdomain");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheck = useCallback(
    debounce(async (subdomain: string) => {
      if (subdomain.length < 3) {
        setAvailability("idle");
        return;
      }
      setAvailability("checking");
      const result =
        await sitesActions.checkSubdomainAvailabilityAction(subdomain);
      if (result.success) {
        setAvailability(result.data.isAvailable ? "available" : "unavailable");
      } else {
        setAvailability("unavailable");
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (dirtyFields.subdomain && !errors.subdomain) {
      debouncedCheck(subdomainValue);
    } else {
      setAvailability("idle");
    }
  }, [subdomainValue, dirtyFields.subdomain, errors.subdomain, debouncedCheck]);

  const renderAvailabilityIcon = () => {
    if (availability === "checking")
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (availability === "available")
      return <Check className="h-4 w-4 text-green-500" />;
    if (availability === "unavailable")
      return <X className="h-4 w-4 text-destructive" />;
    return null;
  };

  return (
    <>
      <div className="flex items-center">
        <div className="relative w-full">
          <Input
            id="subdomain"
            placeholder="tu-sitio-unico"
            className="w-full rounded-r-none focus:z-10 bg-input"
            aria-invalid={errors.subdomain ? "true" : "false"}
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
