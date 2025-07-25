// app/[locale]/login/page.tsx
/**
 * @file Login Page
 * @description Página de inicio de sesión de usuario. Utiliza un formulario de cliente
 * refactorizado para usar el patrón de `useState` y `useTransition` para manejar
 * Server Actions en React 18, gestionando la redirección en caso de éxito.
 *
 * @author Metashark
 * @version 2.1.0 (React 18 Server Action Pattern)
 */
"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginState = {
  error?: string;
  success?: boolean;
};

/**
 * @description Componente del formulario de inicio de sesión.
 */
function LoginForm() {
  const t = useTranslations("LoginPage");
  const router = useRouter();

  const [state, setState] = useState<LoginState>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await login(state, formData);
      setState(result);
    });
  };

  useEffect(() => {
    if (state.success) {
      router.replace("/dashboard");
    }
  }, [state.success, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue="admin@metashark.co"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          defaultValue="password123"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando...
          </>
        ) : (
          t("signInButton")
        )}
      </Button>
    </form>
  );
}

/**
 * @description Página principal que renderiza el formulario de inicio de sesión.
 */
export default function LoginPage() {
  const t = useTranslations("LoginPage");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>
              Introduce tus credenciales para acceder a tu panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **OAuth como Opción Principal:** Integrar botones de "Iniciar Sesión con Google/GitHub" por encima del formulario de credenciales. Para la mayoría de los SaaS, OAuth es la opción preferida por los usuarios.
 * 2. **Enlace "Olvidé mi contraseña":** Añadir un `Link` debajo del botón de inicio de sesión que dirija a un futuro flujo de recuperación de contraseña, el cual puede ser gestionado fácilmente con Supabase Auth.
 * 3. **Manejo de Redirección Post-Login:** La redirección actual va siempre a `/dashboard`. Se podría mejorar para que, si el usuario intentó acceder a una página protegida, sea redirigido a esa página específica después de iniciar sesión. Esto se puede lograr pasando un `callbackUrl` en la URL.
 * 1. **OAuth como Opción Principal:** Integrar botones de "Iniciar Sesión con Google/GitHub" por encima del formulario de credenciales. Para la mayoría de los SaaS, OAuth es la opción preferida por los usuarios.
 * 2. **Enlace "Olvidé mi contraseña":** Añadir un `Link` debajo del botón de inicio de sesión que dirija a un futuro flujo de recuperación de contraseña, el cual puede ser gestionado fácilmente con Supabase Auth.
 * 3. **Manejo de Redirección Post-Login:** La redirección actual va siempre a `/dashboard`. Se podría mejorar para que, si el usuario intentó acceder a una página protegida, sea redirigido a esa página específica después de iniciar sesión. Esto se puede lograr pasando un `callbackUrl` en la URL.
 * 1. **Feedback de Errores:** Implementar `useActionState` para mostrar un mensaje de "Credenciales incorrectas" al usuario directamente en el formulario si el login falla.
 * 2. **Social Logins:** Añadir botones para iniciar sesión con proveedores OAuth (Google, GitHub) para una mejor experiencia de usuario.
 * 1. **Manejo de Errores en UI:** Modificar la Server Action `login` y usar `useActionState` en `LoginForm` para mostrar mensajes de error específicos (ej. "Credenciales inválidas") directamente en el formulario.
 * 2. **Enlace "Olvidé mi contraseña":** Añadir un enlace que dirija a un flujo de recuperación de contraseña.
 * 3. **Botones de OAuth:** Integrar botones para iniciar sesión con Google, GitHub, etc., debajo del formulario de credenciales.
 */
