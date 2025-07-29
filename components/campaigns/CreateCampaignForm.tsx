// Ruta: components/campaigns/CreateCampaignForm.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

import { campaigns as campaignActions } from "@/lib/actions";
import { type ActionResult } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * @file CreateCampaignForm.tsx
 * @description Formulario de cliente para la creación de nuevas campañas.
 *              Se integra directamente con Server Actions para un manejo de estado
 *              y feedback al usuario eficientes.
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 2.2.0 (Accessibility Patch)
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Creando Campaña..." : "Crear Campaña"}
    </Button>
  );
}

export function CreateCampaignForm({
  siteId,
  onSuccess,
}: {
  siteId: string;
  onSuccess: () => void;
}) {
  const initialState: ActionResult = { success: false, error: "" };
  const [state, formAction] = useFormState(
    campaignActions.createCampaignAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Campaña creada con éxito.");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 relative">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Campaña</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ej: Lanzamiento Producto X"
          required
        />
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un formulario de cliente diseñado para la creación de campañas.
 *  1.  **Integración con Server Actions:** Utiliza los hooks `useFormState` y `useFormStatus` de React para una integración nativa. `useFormState` gestiona el estado de la respuesta de la acción, mientras que `useFormStatus` deshabilita el botón de envío y muestra un spinner durante la ejecución.
 *  2.  **Paso de Contexto:** Recibe el `siteId` como una prop y lo incluye en el formulario como un campo oculto. Esto asegura que la Server Action sepa a qué sitio asociar la nueva campaña.
 *  3.  **Manejo de Feedback:** Un hook `useEffect` observa los cambios en el `state` devuelto por la Server Action. Si hay un éxito o un error, utiliza `react-hot-toast` para mostrar una notificación al usuario.
 *  4.  **Comunicación con el Padre:** En caso de éxito, invoca la callback `onSuccess`, permitiendo que el componente padre (el modal `Dialog`) se cierre, desacoplando su lógica interna.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Migración a `react-hook-form`: Para estandarizar todos los formularios de la aplicación, este componente debería ser refactorizado para usar `react-hook-form` con `zodResolver`. Esto habilitaría la validación en tiempo real en el cliente y unificaría la experiencia del desarrollador.
 * 2. Selección de Plantilla de Campaña: Expandir el formulario para incluir un selector visual de plantillas. Esto permitiría al usuario empezar con una estructura de campaña predefinida en lugar de un lienzo en blanco, acelerando el flujo de trabajo.
 * 3. Generación de Slug con Previsualización: A medida que el usuario escribe el nombre de la campaña, se podría mostrar una previsualización en tiempo real del "slug" (la parte de la URL amigable) que se generará, dándole más control sobre sus URLs.
 */
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un formulario de cliente diseñado para la creación de campañas.
 *  1.  **Integración con Server Actions:** Utiliza los hooks `useFormState` y `useFormStatus` de React para una integración nativa. `useFormState` gestiona el estado de la respuesta de la acción, mientras que `useFormStatus` deshabilita el botón de envío y muestra un spinner durante la ejecución.
 *  2.  **Paso de Contexto:** Recibe el `siteId` como una prop y lo incluye en el formulario como un campo oculto. Esto asegura que la Server Action sepa a qué sitio asociar la nueva campaña.
 *  3.  **Manejo de Feedback:** Un hook `useEffect` observa los cambios en el `state` devuelto por la Server Action. Si hay un éxito o un error, utiliza `react-hot-toast` para mostrar una notificación al usuario.
 *  4.  **Comunicación con el Padre:** En caso de éxito, invoca la callback `onSuccess`, permitiendo que el componente padre (el modal `Dialog`) se cierre, desacoplando su lógica interna.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Migración a `react-hook-form`: Para estandarizar todos los formularios de la aplicación, este componente debería ser refactorizado para usar `react-hook-form` con `zodResolver`. Esto habilitaría la validación en tiempo real en el cliente y unificaría la experiencia del desarrollador.
 * 2. Selección de Plantilla de Campaña: Expandir el formulario para incluir un selector visual de plantillas. Esto permitiría al usuario empezar con una estructura de campaña predefinida en lugar de un lienzo en blanco, acelerando el flujo de trabajo.
 * 3. Generación de Slug con Previsualización: A medida que el usuario escribe el nombre de la campaña, se podría mostrar una previsualización en tiempo real del "slug" (la parte de la URL amigable) que se generará, dándole más control sobre sus URLs.
 */
