// app/[locale]/forgot-password/page.tsx
"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth as authActions } from "@/lib/actions";
import { type RequestPasswordResetState } from "@/lib/validators";

/**
 * @file page.tsx
 * @description Página para solicitar la recuperación de contraseña.
 * @author Metashark (Refactorizado por L.I.A Legacy & Validator)
 * @version 3.2.0 (Type-Safe State Initialization)
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("ForgotPasswordPage");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? t("sendingButton") : t("submitButton")}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");

  // CORRECCIÓN CRÍTICA: Se inicializa el estado con `error: null` para cumplir
  // con el nuevo contrato de tipo robustecido `RequestPasswordResetState`.
  // Esto resuelve el error de compilación `TS2322`.
  const initialState: RequestPasswordResetState = { error: null };
  const [state, formAction] = useFormState(
    authActions.requestPasswordResetAction,
    initialState
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, hsl(var(--primary)/0.05), transparent 30%)",
        }}
      />
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt="Logo de MetaShark"
          width={64}
          height={64}
          priority
        />
        <h1 className="mt-4 text-3xl font-bold">{t("title")}</h1>
        <p className="max-w-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-lg">
        <CardHeader />
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="mt-1"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `forgot-password/page.tsx` es el componente de cliente que
 *               renderiza el formulario para iniciar el flujo de recuperación de contraseña.
 *
 * @functionality
 * - **Integración con Server Actions:** Utiliza los hooks `useFormState` y `useFormStatus` de
 *   React para una integración nativa y optimizada con la Server Action `requestPasswordResetAction`.
 * - **Manejo de Estado del Formulario:** `useFormState` gestiona el estado de la respuesta
 *   de la acción, permitiendo mostrar errores de validación o del servidor directamente en la UI.
 * - **Feedback de Usuario:** Un `useEffect` observa los cambios en el estado y utiliza
 *   `react-hot-toast` para mostrar notificaciones de error de forma no intrusiva.
 * - **Corrección de Contrato:** La refactorización clave fue alinear el `initialState`
 *   del formulario con el contrato de datos corregido en `lib/validators/index.ts`,
 *   resolviendo el error de compilación.
 *
 * @relationships
 * - Es una ruta pública definida en `/app/[locale]/forgot-password/`.
 * - Invoca la Server Action `auth.requestPasswordResetAction`.
 * - Su estado es gobernado por el tipo `RequestPasswordResetState` del manifiesto de validadores.
 *
 * @expectations
 * - Se espera que este componente sea un formulario robusto y seguro. Debe proporcionar un
 *   feedback claro al usuario sobre el resultado de su petición y manejar correctamente
 *   el estado de carga para prevenir envíos duplicados.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el flujo de recuperación de contraseña.
 *
 * 1.  **Rate Limiting (Server-Side):** La mejora de seguridad más crítica para este flujo es implementar limitación de tasa real en la `requestPasswordResetAction` del servidor. Esto previene ataques de bombardeo de correos electrónicos y es esencial para un sistema en producción.
 * 2.  **Integración con Servicio de Email Transaccional:** Para mejorar la entregabilidad, el seguimiento y el branding de los correos, la `requestPasswordResetAction` debería integrarse con un servicio como Resend o Postmark en lugar de depender del servicio de email por defecto de Supabase.
 * 3.  **Validación en Tiempo Real en Cliente:** Para una UX superior, se podría migrar este formulario a `react-hook-form` con `zodResolver`. Esto permitiría mostrar errores de validación (ej. "el formato del email es incorrecto") instantáneamente mientras el usuario escribe, sin necesidad de un envío al servidor.
 */
