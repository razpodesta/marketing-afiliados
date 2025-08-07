// app/[locale]/reset-password/page.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { updatePasswordAction } from "@/lib/actions/password.actions";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { cn } from "@/lib/utils";

/**
 * @file page.tsx
 * @description Página para que los usuarios establezcan una nueva contraseña.
 *              Refactorizada para importar su Server Action directamente.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Server-Client Boundary Compliance)
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("ResetPasswordPage");
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {t("submitButton")}
    </Button>
  );
}

const PasswordStrengthMeter = ({ score }: { score: number }) => {
  const t = useTranslations("ResetPasswordPage");
  const strengthLevels = [
    { text: "Muito Fraca", color: "bg-destructive" },
    { text: "Fraca", color: "bg-destructive" },
    { text: "Média", color: "bg-yellow-500" },
    { text: "Forte", color: "bg-green-500" },
    { text: "Muito Forte", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-2 pt-2">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              score > i ? strengthLevels[score].color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {strengthLevels[score].text}
      </p>
    </div>
  );
};

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPasswordPage");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);

  const [state, formAction] = useFormState(updatePasswordAction, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success(
        "Senha atualizada com sucesso! Você será redirecionado para o login."
      );
      setTimeout(() => router.push("/login"), 3000);
    }
  }, [state, router]);

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

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
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="password">{t("newPasswordLabel")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {password.length > 0 && <PasswordStrengthMeter score={strength} />}
            <div>
              <Label htmlFor="confirmPassword">
                {t("confirmPasswordLabel")}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>
            {state.error && (
              <p className="text-sm text-center text-destructive">
                {state.error}
              </p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cumplimiento del Límite Servidor-Cliente**: ((Implementada)) Se ha corregido la importación para desacoplar el componente de cliente del archivo barril, resolviendo el error de build.
 */
// app/[locale]/reset-password/page.tsx
