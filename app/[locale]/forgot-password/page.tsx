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
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
// Se importa la acción directamente desde su archivo de origen,
// rompiendo la dependencia con el archivo barril.
import { requestPasswordResetAction } from "@/lib/actions/password.actions";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { type RequestPasswordResetState } from "@/lib/validators";

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

  const initialState: RequestPasswordResetState = { error: null };
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
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
/**
 * @file page.tsx
 * @description Página para solicitar la recuperación de contraseña.
 *              Ha sido refactorizada para importar su Server Action directamente,
 *              respetando el límite Servidor-Cliente de Next.js.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Server-Client Boundary Compliance)
 */
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cumplimiento del Límite Servidor-Cliente**: ((Implementada)) La importación directa de la Server Action resuelve el error de build y alinea el componente con las mejores prácticas de la arquitectura de Next.js App Router.
 */
// app/[locale]/forgot-password/page.tsx
