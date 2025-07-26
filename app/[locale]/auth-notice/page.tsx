/* Ruta: app/[locale]/auth-notice/page.tsx */

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * @file page.tsx
 * @description Página genérica para mostrar notificaciones al usuario durante los flujos de autenticación.
 * REVISIÓN DE DISEÑO: Se ha rediseñado para alinearse con la identidad de marca,
 * proporcionando una experiencia de usuario profesional y coherente.
 *
 * @author Metashark
 * @version 2.0.0 (Branded Design)
 */

interface AuthNoticePageProps {
  searchParams: {
    message?: "check-email-for-confirmation" | "check-email-for-reset";
  };
}

export default function AuthNoticePage({ searchParams }: AuthNoticePageProps) {
  const t = useTranslations("AuthNoticePage");
  const messageKey = searchParams.message || "default";
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
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{description}</p>
          <Button asChild variant="outline">
            <Link href="/login">Volver a Inicio de Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
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
