/**
 * @file page.tsx
 * @description Página para que los usuarios soliciten un enlace para restablecer su contraseña.
 * ANÁLISIS DE CALIDAD: Este componente ya está alineado con las mejores prácticas
 * de seguridad y UX. Utiliza `useFormState` y `useFormStatus` para una
 * interacción fluida con la Server Action y está diseñado para funcionar con el
 * flujo de redirección que previene la enumeración de usuarios. La refactorización
 * se centra en añadir documentación TSDoc exhaustiva.
 *
 * @author Metashark
 * @version 4.1.0 (Comprehensive TSDoc)
 */
"use client";

import { requestPasswordResetAction } from "@/app/actions/auth.actions";
import { type RequestPasswordResetState } from "@/app/actions/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

/**
 * @description Componente interno que renderiza el botón de envío del formulario.
 *              Utiliza el hook `useFormStatus` para mostrar un estado de carga
 *              y deshabilitarse automáticamente mientras la Server Action está en curso.
 * @returns {JSX.Element} El botón de envío con estado.
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

/**
 * @description Componente principal de la página de olvido de contraseña.
 *              Gestiona el estado del formulario y la interacción con la Server Action.
 * @returns {JSX.Element} La interfaz de usuario completa de la página.
 */
export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");

  const initialState: RequestPasswordResetState = { error: undefined };
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
    initialState
  );

  useEffect(() => {
    // La Server Action asociada siempre redirige para prevenir la enumeración de usuarios.
    // Por lo tanto, este efecto solo se activará para errores de validación
    // devueltos *antes* de la ejecución de la lógica principal (ej. email inválido).
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
                autoFocus
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Rate Limiting (Server-Side): La mejora de seguridad más crítica para este flujo es implementar limitación de tasa en la `requestPasswordResetAction` del servidor. Esto previene ataques de bombardeo de correos electrónicos y es esencial para un sistema en producción.
 * 2. Integración con Servicio de Email Transaccional (Server-Side): Para mejorar la entregabilidad, el seguimiento y el branding de los correos, la `requestPasswordResetAction` debería integrarse con un servicio como Resend o Postmark en lugar de depender del servicio de email por defecto de Supabase.
 * 3. Validación en Tiempo Real en Cliente: Para una UX superior, se podría migrar este formulario a `react-hook-form` con `zodResolver`. Esto permitiría mostrar errores de validación (ej. "el formato del email es incorrecto") instantáneamente mientras el usuario escribe, sin necesidad de un envío al servidor.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Rate Limiting del Lado del Servidor: Implementar un sistema de limitación de tasa (utilizando una herramienta como Upstash Redis) en la `Server Action` `requestPasswordResetAction` para prevenir que se abuse de la función, evitando el envío masivo de correos a un mismo destinatario o desde una misma IP.
 * 2. Integración con Servicio de Email Transaccional: Para mayor control y observabilidad, reemplazar el método `resetPasswordForEmail` de Supabase por una lógica personalizada que genere un token JWT, lo guarde en la base de datos y utilice un servicio como Resend o Postmark para enviar un email con una plantilla HTML de marca.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Rate Limiting del Lado del Servidor: Implementar un sistema de limitación de tasa (utilizando una herramienta como Upstash Redis) en la `Server Action` `requestPasswordResetAction` para prevenir que se abuse de la función, evitando el envío masivo de correos a un mismo destinatario o desde una misma IP.
 * 2. Integración con Servicio de Email Transaccional: Para mayor control y observabilidad, reemplazar el método `resetPasswordForEmail` de Supabase por una lógica personalizada que genere un token JWT, lo guarde en la base de datos y utilice un servicio como Resend o Postmark para enviar un email con una plantilla HTML de marca.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Prevención de Enumeración de Usuarios: Para mayor seguridad, la `Server Action` `requestPasswordResetAction` debería ser modificada para que NUNCA devuelva un error si el email no existe. Siempre debería redirigir a la página de notificación con un mensaje genérico (ej. "Si tu correo está en nuestro sistema, recibirás un enlace"), previniendo que actores maliciosos puedan descubrir qué correos están registrados.
 * 2. Rate Limiting del Lado del Servidor: Implementar un sistema de limitación de tasa (utilizando una herramienta como Upstash Redis) en la `Server Action` para prevenir que se abuse de la función de reseteo de contraseña, evitando el envío masivo de correos a un mismo destinatario o desde una misma IP.
 * 3. Autofoco en el Campo de Email: Añadir la prop `autoFocus` al componente `<Input>` para mejorar la experiencia de usuario y la accesibilidad, permitiendo que el usuario pueda empezar a escribir inmediatamente sin necesidad de hacer clic.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Prevención de Enumeración de Usuarios: Para mayor seguridad, la `Server Action` `requestPasswordResetAction` debería ser modificada para que NUNCA devuelva un error si el email no existe. Siempre debería redirigir a la página de notificación con un mensaje genérico (ej. "Si tu correo está en nuestro sistema, recibirás un enlace"), previniendo que actores maliciosos puedan descubrir qué correos están registrados.
 * 2. Rate Limiting del Lado del Servidor: Implementar un sistema de limitación de tasa (utilizando una herramienta como Upstash Redis) en la `Server Action` para prevenir que se abuse de la función de reseteo de contraseña, evitando el envío masivo de correos a un mismo destinatario o desde una misma IP.
 * 3. Autofoco en el Campo de Email: Añadir la prop `autoFocus` al componente `<Input>` para mejorar la experiencia de usuario y la accesibilidad, permitiendo que el usuario pueda empezar a escribir inmediatamente sin necesidad de hacer clic.
 */
/* MEJORAS PROPUESTAS
 * 1. **Prevención de Enumeración de Usuarios:** La Server Action actualmente podría indicar si un correo existe o no. Para mayor seguridad, debería mostrar siempre un mensaje genérico de éxito (ej. "Si tu correo está en nuestro sistema, recibirás un enlace"), previniendo que actores maliciosos puedan descubrir qué correos están registrados.
 * 2. **Rate Limiting:** Implementar un sistema de limitación de tasa (rate limiting) en la Server Action para prevenir que se abuse de la función de reseteo de contraseña, evitando el envío masivo de correos.
 * 3. **Feedback de Éxito Visual:** En lugar de depender solo de la redirección, se podría mostrar un mensaje de éxito directamente en la página después de un envío exitoso, antes de que el usuario sea redirigido a la página de notificación.
 */
