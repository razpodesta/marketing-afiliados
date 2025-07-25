// app/[locale]/signup/page.tsx
/**
 * @file Signup Page
 * @description Renderiza el formulario de registro para nuevos usuarios.
 * Refactorizado para ser compatible con React 18, usando `useState` y `useTransition`.
 *
 * @author Metashark
 * @version 1.1.0 (React 18 Compatibility)
 */
"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { signupUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupState = {
  error?: string;
  success?: boolean;
};

/**
 * @description Componente del formulario de registro.
 */
function SignupForm() {
  const t = useTranslations("SignupPage");
  const [state, setState] = useState<SignupState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signupUser(state, formData);
      if(result.success) {
        toast.success(t("successMessage"));
        // Opcional: podrías resetear el formulario aquí o redirigir
      } else {
        setState(result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
        <Input id="fullName" name="fullName" type="text" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("creatingAccountButton")}
          </>
        ) : (
          t("createAccountButton")
        )}
      </Button>
    </form>
  );
}

/**
 * @description Página principal de registro.
 */
export default function SignupPage() {
  const t = useTranslations("SignupPage");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <p className="mt-4 text-center text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                {t("signInLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Validación de Contraseña del Lado del Cliente:** Añadir validación en tiempo real para la fortaleza de la contraseña y para asegurar que las dos contraseñas coincidan antes de enviar el formulario.
 * 2. **Integración con OAuth:** Añadir botones "Registrarse con Google/GitHub" para simplificar el proceso de registro, utilizando los proveedores de Supabase Auth.
 * 3. **Verificación de Email:** Configurar la verificación de email en Supabase Auth. La Server Action ya está lista para esto; solo falta configurar el proveedor de email en Supabase.
 * 1. **Validación de Contraseña del Lado del Cliente:** Añadir validación en tiempo real para la fortaleza de la contraseña y para asegurar que las dos contraseñas coincidan antes de enviar el formulario.
 * 2. **Integración con OAuth:** Añadir botones "Registrarse con Google/GitHub" para simplificar el proceso de registro, utilizando los proveedores de Supabase Auth.
 * 3. **Verificación de Email:** Configurar la verificación de email en Supabase Auth y mostrar un mensaje de "Por favor, revisa tu correo para verificar tu cuenta" después de un registro exitoso.
 */
