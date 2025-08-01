// Ruta: components/sites/SubdomainInput.tsx
/**
 * @file SubdomainInput.tsx
 * @description Componente de campo de formulario especializado y autocontenido para
 *              la validación de subdominios. Encapsula la lógica de debounce y la
 *              verificación asíncrona en tiempo real contra el servidor.
 *              Proporciona feedback visual claro sobre la disponibilidad del subdominio.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 1.0.0 (Optimal Implementation)
 */
"use client";

import { Check, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form"; // Importa el tipo completo de UseFormReturn

import { Input } from "@/components/ui/input";
import { sites as sitesActions } from "@/lib/actions";
import { debounce, rootDomain } from "@/lib/utils";

type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable";

interface SubdomainInputProps {
  // Se tipa la prop `form` como `UseFormReturn<any>` para ser flexible.
  // A futuro, se podría hacer más estricta con el tipo `FormInputData` del formulario padre.
  form: UseFormReturn<any>;
}

export function SubdomainInput({ form }: SubdomainInputProps) {
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const {
    register,
    watch,
    formState: { errors, dirtyFields },
  } = form; // Desestructuramos directamente de la prop 'form'

  const subdomainValue = watch("subdomain"); // Observa el valor del campo 'subdomain'

  // Función de debounce para la verificación de disponibilidad
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheck = useCallback(
    debounce(async (subdomain: string) => {
      // No verificar si el subdominio es demasiado corto para una verificación inicial.
      // La validación Zod del formulario padre ya debería manejar esto, pero es una segunda capa.
      if (subdomain.length < 3) {
        setAvailability("idle");
        return;
      }
      setAvailability("checking"); // Muestra el spinner de carga
      const result =
        await sitesActions.checkSubdomainAvailabilityAction(subdomain);
      if (result.success) {
        setAvailability(result.data.isAvailable ? "available" : "unavailable");
      } else {
        // En caso de error del servidor, se asume no disponible o se muestra un estado de error.
        setAvailability("unavailable");
        // A futuro, podríamos loggear el error del servidor aquí o mostrar un mensaje específico.
      }
    }, 500), // Debounce de 500ms
    [] // Dependencia vacía para que useCallback solo se cree una vez.
  );

  // Efecto que reacciona a los cambios en el valor del subdominio
  useEffect(() => {
    // Solo dispara la verificación debounced si el campo ha sido "tocado"
    // y si no hay errores de validación síncronos de Zod para el subdominio.
    if (dirtyFields.subdomain && !errors.subdomain) {
      debouncedCheck(subdomainValue);
    } else {
      // Si el campo no está "dirty" o tiene errores de Zod, resetea el estado de disponibilidad.
      setAvailability("idle");
    }
  }, [subdomainValue, dirtyFields.subdomain, errors.subdomain, debouncedCheck]);

  // Función auxiliar para renderizar el icono de estado
  const renderAvailabilityIcon = () => {
    if (availability === "checking") {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (availability === "available") {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (availability === "unavailable") {
      return <X className="h-4 w-4 text-destructive" />;
    }
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
            // `aria-invalid` se basa en los errores de Zod del formulario padre
            aria-invalid={errors.subdomain ? "true" : "false"}
            {...register("subdomain")} // Registra el input con react-hook-form
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {renderAvailabilityIcon()}{" "}
            {/* Muestra el icono de disponibilidad */}
          </div>
        </div>
        {/* Sufijo del dominio: .metashark.com o .localhost:3000 */}
        <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground">
          .{rootDomain}
        </span>
      </div>
      {/* Muestra los errores de validación de Zod del formulario padre para el subdominio */}
      {errors.subdomain && (
        <p className="text-sm text-destructive" role="alert">
          {errors.subdomain.message as string}
        </p>
      )}
      {/* Muestra el mensaje de subdominio no disponible solo si no hay un error de Zod */}
      {availability === "unavailable" && !errors.subdomain && (
        <p className="text-sm text-destructive" role="alert">
          Este subdominio ya está en uso.
        </p>
      )}
    </>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Tipado Estricto de `form` Prop:** Aunque `UseFormReturn<any>` funciona, tipar la prop `form` con el tipo `FormInputData` exacto del formulario padre (`z.infer<typeof CreateSiteSchema>`) mejoraría la seguridad de tipos interna de `SubdomainInput`, proporcionando autocompletado y validación de tipos más precisa para `watch`, `register`, `errors`, etc., sin depender de `any`.
 * 2.  **Manejo de Errores Específicos de API:** Actualmente, si `sites.actions.checkSubdomainAvailabilityAction` falla por un error del servidor, se muestra un mensaje genérico de "unavailable". Se podría mejorar para mostrar mensajes de error más contextuales o específicos devueltos por la Server Action, como "Error de red al verificar el subdominio".
 * 3.  **Indicador de Carga para Peticiones Lentas:** Aunque `Loader2` ya indica que se está verificando, para peticiones de red muy lentas, se podría añadir un tooltip o un pequeño texto "Verificando disponibilidad..." junto al campo para mayor claridad, especialmente en conexiones deficientes.
 * 4.  **Integración con Tooltip para Explicación:** El componente podría tener un icono de ayuda junto al label que, al hacer hover, muestre un `Tooltip` explicando las reglas de nomenclatura de subdominios y por qué es importante su unicidad.
 * 5.  **Refactorización a un Hook Personalizado:** Si la lógica de verificación de disponibilidad (debounce, estados de `availability`, llamada a la Server Action) se necesitara en múltiples lugares o se quisiera desacoplar aún más, podría extraerse a un hook personalizado como `useSubdomainAvailability(subdomainValue)`.
 */
