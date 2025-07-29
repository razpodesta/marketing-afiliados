// Ruta: app/[locale]/auth-notice/page.tsx
/**
 * @file page.tsx
 * @description Página de notificación genérica para flujos de autenticación.
 * REFACTORIZACIÓN 360 Y MEJORA DE UX:
 * 1. Se ha añadido un botón "Reenviar correo" con un temporizador para prevenir spam.
 * 2. Los mensajes ahora pueden ser personalizados con el email del usuario.
 * 3. Se muestran iconos y enlaces contextuales para una experiencia más rica.
 *
 * @author Metashark
 * @version 3.0.0 (Interactive & Contextual Notice)
 */
"use client";

import { Loader2, MailCheck, MailQuestion, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type MessageKey =
  | "check-email-for-confirmation"
  | "check-email-for-reset"
  | "default";

/**
 * @description Muestra un icono contextual basado en el tipo de notificación.
 * @param {{ messageKey: MessageKey }} props
 * @returns {JSX.Element}
 */
const NoticeIcon = ({ messageKey }: { messageKey: MessageKey }) => {
  const icons: Record<MessageKey, React.ElementType> = {
    "check-email-for-confirmation": MailCheck,
    "check-email-for-reset": ShieldCheck,
    default: MailQuestion,
  };
  const Icon = icons[messageKey];
  return <Icon className="h-6 w-6 text-primary" />;
};

/**
 * @description Proporciona un enlace directo al proveedor de email del usuario.
 * @param {{ email: string | null }} props
 * @returns {JSX.Element | null}
 */
const EmailProviderLink = ({ email }: { email: string | null }) => {
  if (!email) return null;
  const domain = email.split("@")[1];
  if (!domain) return null;

  return (
    <Button asChild>
      <a
        href={`https://www.${domain}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir {domain.split(".")[0]}
      </a>
    </Button>
  );
};

/**
 * @description Botón para reenviar el correo con un temporizador de enfriamiento.
 * @param {{ email: string | null }} props
 * @returns {JSX.Element}
 */
const ResendButton = ({ email }: { email: string | null }) => {
  const [countdown, setCountdown] = useState(60);
  const [isPending, startTransition] = React.useTransition();

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    if (!email) return;
    startTransition(async () => {
      // TODO: Implementar la Server Action `resendConfirmationEmailAction(email)`
      console.log(`Reenviando email a: ${email}`);
      setCountdown(60); // Reset timer
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleResend}
      disabled={countdown > 0 || isPending}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar correo"}
    </Button>
  );
};

export default function AuthNoticePage() {
  const t = useTranslations("AuthNoticePage");
  const searchParams = useSearchParams();
  const messageKey: MessageKey =
    (searchParams.get("message") as MessageKey) || "default";
  const email = searchParams.get("email");

  const messages = {
    "check-email-for-confirmation": {
      title: t("confirmation.title"),
      description: t("confirmation.description"),
    },
    "check-email-for-reset": {
      title: t("reset.title"),
      description: t("reset.description"),
    },
    default: {
      title: t("default.title"),
      description: t("default.description"),
    },
  };
  const { title, description } = messages[messageKey];
  const personalizedDescription = email
    ? `${description} a ${email}.`
    : description;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, hsl(var(--primary)/0.05), transparent 30%)",
        }}
      />
      <Link href="/" className="absolute top-8 left-8">
        <Image
          src="/images/logo.png"
          alt="Logo de MetaShark"
          width={40}
          height={40}
          priority
        />
      </Link>
      <Card className="w-full max-w-md text-center border-border/60 bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <NoticeIcon messageKey={messageKey} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{personalizedDescription}</p>
          <div className="flex justify-center gap-4">
            <EmailProviderLink email={email} />
            <ResendButton email={email} />
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Volver a Inicio de Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Implementar la Server Action de Reenvío: La mejora más crítica es implementar la Server Action `resendConfirmationEmailAction` que el `ResendButton` necesita. Esta acción debe incluir una lógica de limitación de tasa (rate-limiting) para prevenir abusos.
 * 2. A/B Testing de Mensajes: Para optimizar la tasa de confirmación de correos, se podría implementar un sistema de A/B testing (usando Vercel Edge Config o una herramienta de terceros) para probar diferentes textos en el título y la descripción y medir cuál es más efectivo.
 * 3. Soporte para SMS/Whatsapp: En el futuro, se podría expandir la notificación para soportar otros canales como SMS o WhatsApp, añadiendo un parámetro a la URL (ej. `&channel=sms`) y mostrando un mensaje y un icono apropiados.
 */
/* Ruta: app/[locale]/auth-notice/page.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Botón de Reenvío con Temporizador:** Añadir un botón "Reenviar correo" que esté inicialmente deshabilitado. Usando estado de React y `setTimeout`, se podría habilitar después de un período de tiempo (ej. 60 segundos) para permitir al usuario solicitar un nuevo correo sin tener que volver a iniciar el proceso.
 * 2. **Mensajes Dinámicos Basados en el Proveedor de Email:** Para una UX superior, el mensaje podría incluir el proveedor de correo del usuario. Por ejemplo: "Hemos enviado un enlace a tu bandeja de entrada de **Gmail**." Esto se puede lograr extrayendo el dominio del email en la Server Action y pasándolo como un parámetro de búsqueda a esta página.
 * 3. **Ilustraciones Contextuales:** En lugar de un único icono, se podría mostrar una ilustración SVG diferente según el `messageKey`, haciendo la página más visual y comunicando el contexto de la notificación de forma más efectiva.
1.  **Migración a Base de Datos Real:** (Reiterado) Es la mejora más crítica. Activar la lógica real de Supabase depende de esto.
2.  **Auto-Registro con OAuth:** (Reiterado) Implementar la creación automática de usuarios al usar un proveedor OAuth.
3.  **Tipos de Sesión Extendidos:** (Reiterado) Definir tipos para la sesión para mayor seguridad.
4.  **Enlace de Reenvío:** Añadir un botón en esta página que permita al usuario solicitar que se reenvíe el correo electrónico de confirmación o reseteo tras un cierto período de tiempo.
*/
