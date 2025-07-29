// app/[locale]/reset-password/page.tsx
"use client";

import { password as passwordActions } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";

/**
 * @file page.tsx
 * @description Página para que los usuarios establezcan una nueva contraseña.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Architectural Alignment)
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

  const [state, formAction] = useFormState(
    passwordActions.updatePasswordAction,
    { error: null, success: false }
  );

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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Prevención de Reutilización de Contraseña: Para una seguridad de nivel empresarial, la Server Action `updatePasswordAction` podría consultar un hash de las N contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente.
 * 2. Integración con `zxcvbn`: En lugar de una lógica de puntuación simple, se podría integrar una librería como `zxcvbn-ts` para un análisis de fortaleza de contraseña mucho más robusto y preciso, que detecta patrones comunes y palabras de diccionario.
 * 3. Internacionalización de Mensajes de Error de Zod: Integrar `zod-i18n` para que los mensajes de error del esquema de validación (ej. "Las contraseñas no coinciden") se traduzcan automáticamente según el idioma del usuario.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Prevención de Reutilización de Contraseña: Para una seguridad de nivel empresarial, la Server Action `updatePasswordAction` podría consultar un hash de las N contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente.
 * 2. Integración con `zxcvbn`: En lugar de una lógica de puntuación simple, se podría integrar una librería como `zxcvbn-ts` para un análisis de fortaleza de contraseña mucho más robusto y preciso, que detecta patrones comunes y palabras de diccionario.
 * 3. Forzar Cierre de Sesión en Otros Dispositivos: Después de una actualización de contraseña exitosa, se podría invocar `supabase.auth.signOut({ scope: 'others' })` en la Server Action para invalidar todas las demás sesiones activas del usuario, una práctica de seguridad recomendada que ya está contemplada en la acción.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Prevención de Reutilización de Contraseña: Para una seguridad de nivel empresarial, la Server Action `updatePasswordAction` podría consultar un hash de las N contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente.
 * 2. Integración con `zxcvbn`: En lugar de una lógica de puntuación simple, se podría integrar una librería como `zxcvbn-ts` para un análisis de fortaleza de contraseña mucho más robusto y preciso, que detecta patrones comunes y palabras de diccionario.
 * 3. Forzar Cierre de Sesión en Otros Dispositivos: Después de una actualización de contraseña exitosa, se podría invocar `supabase.auth.signOut({ scope: 'others' })` en la Server Action para invalidar todas las demás sesiones activas del usuario, una práctica de seguridad recomendada.
 */
/* Ruta: app/[locale]/reset-password/page.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Indicador de Fortaleza de Contraseña: Integrar un componente visual que dé feedback en tiempo real sobre la fortaleza de la nueva contraseña (débil, media, fuerte) a medida que el usuario escribe. Esto se puede lograr con una librería como `zxcvbn` y ayuda a los usuarios a crear contraseñas más seguras.
 * 2. Prevención de Reutilización de Contraseña: Para una seguridad de nivel empresarial, la lógica de actualización podría ser migrada a una Server Action. Esta acción podría consultar un hash de las contraseñas anteriores del usuario (si se guardan de forma segura) para prevenir que reutilicen una contraseña reciente, una práctica de seguridad recomendada.
 * 3. Manejo de Token Expirado/Inválido: El mensaje de error actual de Supabase puede ser técnico. La lógica podría interceptar específicamente los errores de token inválido y mostrar un mensaje más amigable como: "Este enlace de restablecimiento ha expirado o ya ha sido utilizado. Por favor, solicita uno nuevo.", con un enlace conveniente para reiniciar el proceso.
 */
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
