"use client";

import { requestPasswordResetAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useTransition, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

/**
 * @file page.tsx
 * @description Página para que los usuarios soliciten un enlace para restablecer su contraseña.
 * REVISIÓN DE DISEÑO: Se ha rediseñado para alinearse con la identidad de marca
 * del portal de autenticación, proporcionando una experiencia de usuario coherente.
 *
 * @author Metashark
 * @version 2.0.0 (Branded Design)
 */
export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Maneja el envío del formulario, llamando a la Server Action
   * `requestPasswordResetAction` y gestionando los estados de carga y error.
   * @param {FormData} formData - Los datos del formulario.
   */
  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
      // La redirección en caso de éxito la maneja la Server Action.
    });
  };

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
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="mt-1"
                disabled={isPending}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t("sendingButton") : t("submitButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
/* Ruta: app/[locale]/forgot-password/page.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Prevención de Enumeración de Usuarios:** La Server Action actualmente podría indicar si un correo existe o no. Para mayor seguridad, debería mostrar siempre un mensaje genérico de éxito (ej. "Si tu correo está en nuestro sistema, recibirás un enlace"), previniendo que actores maliciosos puedan descubrir qué correos están registrados.
 * 2. **Rate Limiting:** Implementar un sistema de limitación de tasa (rate limiting) en la Server Action para prevenir que se abuse de la función de reseteo de contraseña, evitando el envío masivo de correos.
 * 3. **Feedback de Éxito Visual:** En lugar de depender solo de la redirección, se podría mostrar un mensaje de éxito directamente en la página después de un envío exitoso, antes de que el usuario sea redirigido a la página de notificación.
 */
