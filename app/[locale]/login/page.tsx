// Ruta: app/[locale]/login/page.tsx
/**
 * @file app/[locale]/login/page.tsx
 * @description Página de inicio de sesión principal (Server Component).
 * REFACTORIZADO:
 * 1.  Implementa redirección inteligente post-login usando el parámetro `next`.
 * 2.  Añade un esqueleto de carga (`Suspense`) para mejorar la UX.
 * 3.  Genera metadatos dinámicos para SEO.
 * 4.  CORREGIDO: Uso correcto de las funciones de traducción de `next-intl`,
 *     resolviendo el error de tipado `TS2339`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.0.0 (Translation Typo Fix)
 */
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react"; // Importar Suspense
import { headers } from "next/headers"; // Para leer searchParams en Server Component

import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

/**
 * @function generateMetadata
 * @description Genera metadatos dinámicos para la página de login, incluyendo el título traducido.
 * @returns {Promise<import("next").Metadata>} Los metadatos de la página.
 */
export async function generateMetadata(): Promise<import("next").Metadata> {
  const tLoginPage = await getTranslations("LoginPage"); // Obtener la función t para LoginPage
  return {
    title: tLoginPage("metadataTitle"), // Usar la función t correctamente
  };
}

/**
 * @function LoginPageContent
 * @description Componente interno que carga los datos y renderiza el formulario de login.
 *              Envuelto en Suspense por el componente padre.
 * @param {{ searchParams: { next?: string } }} props - Parámetros de búsqueda de la URL.
 * @returns {Promise<JSX.Element>} El formulario de login o una redirección.
 */
async function LoginPageContent({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const t = await getTranslations("LoginPage"); // Obtener la función t para LoginPage
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirección inteligente: Si el usuario ya está autenticado,
  // lo enviamos al dashboard o a la página que intentaba visitar.
  if (session) {
    const redirectTo = searchParams.next || "/dashboard";
    return redirect(redirectTo);
  }

  // Objeto de localización para los textos del componente de Supabase UI
  const localization = {
    variables: {
      sign_in: {
        email_label: t("emailLabel"),
        password_label: t("passwordLabel"),
        button_label: t("signInButton"),
        social_provider_text: t("signInWith"),
        link_text: t("alreadyHaveAccount"),
        // Asegúrate de que estas claves existan en tus archivos JSON de traducción.
        forgot_password_text: t("forgotPasswordLink"),
      },
      sign_up: {
        email_label: t("emailLabel"),
        password_label: t("passwordLabel"),
        button_label: t("signUpButton"),
        social_provider_text: t("signUpWith"),
        link_text: t("dontHaveAccount"),
      },
      forgotten_password: {
        link_text: t("forgotPasswordLink"),
        button_label: t("sendInstructionsButton"),
        email_label: t("emailLabel"),
      },
    },
  };

  // Pasamos el parámetro `next` al LoginForm para que la UI de Supabase lo use en `redirectTo`.
  const nextPath = searchParams.next || undefined;

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-lg">
      <CardContent className="pt-6">
        <LoginForm
          localization={localization}
          defaultView="sign_in"
          next={nextPath}
        />
      </CardContent>
    </Card>
  );
}

/**
 * @function LoginPageSkeleton
 * @description Esqueleto de carga para la página de login.
 * @returns {JSX.Element} La UI del esqueleto.
 */
const LoginPageSkeleton = () => (
  <Card className="w-full max-w-md h-96 animate-pulse border-border/60 bg-card/50 backdrop-blur-lg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-48 bg-muted rounded-md" />
      <div className="h-8 w-64 bg-muted rounded-md" />
      <div className="h-6 w-32 bg-muted rounded-md" />
    </div>
  </Card>
);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const t = await getTranslations("LoginPage"); // Obtener la función t para la renderización del título/subtítulo.
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
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Suspense fallback={<LoginPageSkeleton />}>
        <LoginPageContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Rutas Separadas para Sign Up: Crear una ruta `/signup` que renderice este mismo componente pero pase `defaultView="sign_up"` a `LoginForm`, proporcionando URLs semánticas distintas para el registro y el inicio de sesión, en lugar de depender de los botones internos del formulario de Supabase Auth UI.
 * 2. Mensajes de Error de Supabase Traducidos: La UI de Supabase Auth puede mostrar mensajes de error genéricos del backend. Una mejora sería interceptar estos errores, mapearlos a claves de traducción específicas y mostrar mensajes más amigables y traducidos a través de `react-hot-toast`.
 * 3. Auditoría de Login (Exitoso y Fallido): Extender las Server Actions de autenticación para registrar intentos de login (exitosos y fallidos) en la tabla `audit_logs` con la dirección IP, user agent y la hora.
 */
// Ruta: app/[locale]/login/page.tsx
