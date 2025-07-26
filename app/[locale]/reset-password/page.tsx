/* Ruta: app/[locale]/reset-password/page.tsx */

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * @file page.tsx
 * @description Página que permite a los usuarios establecer una nueva contraseña.
 * REVISIÓN DE DISEÑO: Se ha rediseñado para alinearse con la identidad de marca
 * del portal de autenticación, proporcionando una experiencia de usuario coherente.
 *
 * @author Metashark
 * @version 3.0.0 (Branded Design & Supabase Logic)
 */

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type FormState = { message: string; type: "success" | "error" } | null;

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPasswordPage");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>(null);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Evento PASSWORD_RECOVERY detectado para la sesión.");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState(null);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validation = ResetPasswordSchema.safeParse(data);
    if (!validation.success) {
      setFormState({
        message: validation.error.errors[0].message,
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: validation.data.password,
      });

      if (error) {
        setFormState({
          message: error.message || "No se pudo actualizar la contraseña. El enlace puede haber expirado.",
          type: "error",
        });
      } else {
        setFormState({
          message: "¡Contraseña actualizada con éxito! Serás redirigido al login.",
          type: "success",
        });
        setTimeout(() => router.push("/login"), 3000);
      }
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
      </div>
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-lg">
        <CardHeader />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">{t("newPasswordLabel")}</Label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1" />
            </div>
            {formState && (
              <p
                className={`text-sm text-center ${
                  formState.type === "error" ? "text-destructive" : "text-green-500"
                }`}
              >
                {formState.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("submitButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
/* Ruta: app/[locale]/reset-password/page.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Indicador de Fortaleza de Contraseña:** Integrar un componente visual que dé feedback en tiempo real sobre la fortaleza de la nueva contraseña (débil, media, fuerte) a medida que el usuario escribe, basándose en criterios como longitud, uso de mayúsculas, números y símbolos.
 * 2. **Migración a Server Action:** Para alinear este formulario con las mejores prácticas del proyecto, la lógica de `handleSubmit` debería ser migrada a una Server Action. Esto eliminaría la necesidad de `useEffect` y `useTransition` en el cliente, simplificando el componente y mejorando la seguridad.
 * 3. **Prevención de Reutilización de Contraseña:** La Server Action podría consultar un hash de las contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente, una práctica de seguridad recomendada.
 * 1. **Indicador de Fortaleza de Contraseña:** Integrar un componente visual que dé feedback en tiempo real sobre la fortaleza de la nueva contraseña (débil, media, fuerte) a medida que el usuario escribe, basándose en criterios como longitud, uso de mayúsculas, números y símbolos.
 * 2. **Migración a Server Action:** Para alinear este formulario con las mejores prácticas del proyecto, la lógica de `handleSubmit` debería ser migrada a una Server Action. Esto eliminaría la necesidad de `useEffect` y `useTransition` en el cliente, simplificando el componente y mejorando la seguridad.
 * 3. **Prevención de Reutilización de Contraseña:** La Server Action podría consultar un hash de las contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente, una práctica de seguridad recomendada.
1.  **Server Action:** Migrar la lógica del `handleSubmit` a una Server Action para mayor seguridad y simplicidad.
2.  **Indicadores de Fortaleza de Contraseña:** Añadir un componente visual que indique la fortaleza de la nueva contraseña.
3.  **Manejo de Sesión Expirada:** Si el token de reseteo expira, el `updateUser` fallará. Mostrar un mensaje claro al usuario pidiéndole que solicite un nuevo enlace.
1.  **Integración Real con Supabase Client:** La lógica del `handleSubmit` debe ser reemplazada por el método `supabase.auth.updateUser()` usando el cliente de Supabase para navegador. El token de acceso necesario para esta operación lo proporciona Supabase en la URL después de que el usuario hace clic en el enlace de reseteo.
2.  **Server Action:** En lugar de un `fetch` a una API, el formulario podría usar una Server Action para mayor simplicidad y seguridad, eliminando la necesidad de un endpoint de API explícito.
3.  **Indicadores de Fortaleza de Contraseña:** Añadir un componente visual que indique la fortaleza de la nueva contraseña a medida que el usuario la escribe.
*/
