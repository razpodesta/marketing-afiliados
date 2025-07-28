// Ruta: components/sites/CreateSiteForm.tsx
"use client";

import { SiteSchema } from "@/app/actions/schemas";
import { checkSubdomainAvailabilityAction } from "@/app/actions/sites.actions";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce, rootDomain } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

type FormData = z.infer<typeof SiteSchema>;
type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable";

interface CreateSiteFormProps {
  // CORRECCIÓN: La firma de la prop onSubmit se ha actualizado para aceptar
  // un objeto FormData, que es lo que la lógica de actualización optimista necesita.
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateSiteForm({
  onSubmit,
  isSubmitting,
}: CreateSiteFormProps) {
  const t = useTranslations("SubdomainForm");
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(SiteSchema),
    mode: "onChange",
  });

  const subdomainValue = watch("subdomain");

  const debouncedCheck = useCallback(
    debounce(async (subdomain: string) => {
      if (subdomain.length < 3) {
        setAvailability("idle");
        return;
      }
      setAvailability("checking");
      const { isAvailable } = await checkSubdomainAvailabilityAction(subdomain);
      setAvailability(isAvailable ? "available" : "unavailable");
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

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

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
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 relative"
    >
      <div
        data-lia-marker="true"
        className="absolute -top-4 -left-4 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
      >
        CreateSiteForm.tsx
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">{t("subdomainLabel")}</Label>
        <div className="flex items-center">
          <div className="relative w-full">
            <Input
              id="subdomain"
              placeholder={t("subdomainPlaceholder")}
              className="w-full rounded-r-none focus:z-10 bg-input"
              {...register("subdomain")}
              autoFocus
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
          <p className="text-sm text-destructive">{errors.subdomain.message}</p>
        )}
        {availability === "unavailable" && (
          <p className="text-sm text-destructive">
            Este subdominio ya está en uso.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("iconLabel")}</Label>
        <Controller
          name="icon"
          control={control}
          defaultValue="🚀"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal bg-input"
                >
                  <span className="mr-4 text-2xl">{field.value}</span>
                  <span>{t("selectEmoji")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0">
                <EmojiPicker
                  onEmojiSelect={({ emoji }) => field.onChange(emoji)}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || availability !== "available"}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? t("creatingButton") : t("createButton")}
      </Button>
    </form>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato funciona como un formulario de cliente inteligente para crear sitios.
 *  Su lógica se basa en el hook `useForm` de `react-hook-form` para gestionar el estado y la validación.
 *  1.  **Validación Síncrona:** Al cambiar un campo, Zod valida instantáneamente el formato (ej. longitud mínima del subdominio).
 *  2.  **Validación Asíncrona:** El hook `useEffect` observa cambios en el campo 'subdomain'. Si es válido, llama a una versión "debounced" de `checkSubdomainAvailabilityAction`. Esto previene llamadas a la API en cada pulsación de tecla, mejorando el rendimiento.
 *  3.  **Gestión de Estado de UI:** El estado `availability` se actualiza para mostrar un icono de carga, éxito o error junto al input, proporcionando feedback claro al usuario.
 *  4.  **Envío Seguro:** El botón de envío se deshabilita si la validación asíncrona no es exitosa (`availability !== "available"`) o si el formulario ya se está enviando (`isSubmitting`), garantizando la integridad de los datos.
 *  5.  **Comunicación Externa:** Al tener éxito, invoca la callback `onSuccess`, permitiendo al componente padre (el modal) cerrarse a sí mismo, desacoplando así su lógica interna.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Sugerencias de Subdominios: Si el subdominio elegido no está disponible, se podría invocar una Server Action que use lógica simple o una IA para sugerir alternativas disponibles (ej. "tu-subdominio-123", "tu-subdominio-pro"). Esto mejora la experiencia de usuario al evitarle la frustración de tener que adivinar un nombre válido.
 * 2. Previsualización en Vivo: Añadir una pequeña sección de previsualización dentro del modal que muestre cómo se verá la URL del subdominio y el ícono seleccionado. Esta previsualización se actualizaría en tiempo real a medida que el usuario escribe, reforzando la conexión entre la entrada de datos y el resultado final.
 * 3. Selector de Plantillas Iniciales: Expandir el formulario para incluir un selector visual de plantillas. Esto permitiría al usuario empezar con una estructura de sitio predefinida (ej. "Landing de Producto", "Página de Captura de Leads") en lugar de un lienzo en blanco, acelerando drásticamente su flujo de trabajo inicial.
 */
