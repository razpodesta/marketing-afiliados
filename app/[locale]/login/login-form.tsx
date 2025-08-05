// Ruta: app/[locale]/login/login-form.tsx
/**
 * @file login-form.tsx
 * @description Componente de Cliente para el Formulario de Autenticación de Supabase.
 * REFACTORIZACIÓN 360:
 * 1.  Se ha implementado el manejo de errores desde la URL para mostrar feedback
 *     al usuario usando un componente de Alerta.
 * 2.  Se ha añadido una prop `defaultView` para que el formulario pueda mostrar
 *     "Sign In" o "Sign Up" dinámicamente.
 * 3.  Se ha añadido un fallback en la UI para el caso en que la variable de
 *     entorno `NEXT_PUBLIC_SITE_URL` no esté configurada.
 * 4.  REFACTORIZADO: Ahora acepta y utiliza el parámetro `next` para la
 *     redirección inteligente post-login.
 * @author Metashark
 * @version 7.0.0 (Smart Redirect Integration)
 */
"use client";

import { Auth } from "@supabase/auth-ui-react";
import type { Provider } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { brandTheme } from "@/lib/supabase/auth-theme";
import { createClient } from "@/lib/supabase/client";

// Asumimos que estos componentes de shadcn/ui existen en el proyecto
// aunque no estén en el snapshot.
const Alert = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-4 border rounded-md ${className}`}>{children}</div>;
const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

/**
 * @description Lee las variables de entorno para determinar qué proveedores de OAuth mostrar.
 * @returns {Provider[]} Un array de strings de proveedores válidos para Supabase.
 */
function getOAuthProviders(): Provider[] {
  const providersEnv = process.env.NEXT_PUBLIC_OAUTH_PROVIDers || "google";
  const validProviders: Provider[] = [
    "google",
    "github",
    "azure",
    "bitbucket",
    "gitlab",
    "slack",
    "spotify",
    "twitch",
    "twitter",
    "discord",
    "apple",
  ];
  return providersEnv
    .split(",")
    .map((p) => p.trim() as Provider)
    .filter((p) => validProviders.includes(p));
}

/**
 * @description Propiedades para el componente LoginForm.
 * @property {any} localization - Objeto de localización para los textos.
 * @property {'sign_in' | 'sign_up'} [defaultView] - La vista a mostrar por defecto.
 * @property {string} [next] - Ruta a redirigir después de un login exitoso.
 */
interface LoginFormProps {
  localization: any;
  defaultView?: "sign_in" | "sign_up";
  next?: string; // <-- NUEVA PROP
}

export function LoginForm({
  localization,
  defaultView = "sign_in",
  next, // <-- RECIBE LA NUEVA PROP
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const providers = getOAuthProviders();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error(
      "FATAL: NEXT_PUBLIC_SITE_URL environment variable is not set."
    );
    return (
      <Alert className="bg-destructive/10 border-destructive/50 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error de configuración del sistema. La aplicación no puede proceder
          con la autenticación. Por favor, contacte al soporte.
        </AlertDescription>
      </Alert>
    );
  }

  // Si hay un parámetro `next`, lo añadimos a la URL de redirección para Supabase.
  const redirectUrl = next
    ? `${siteUrl}/api/auth/callback?next=${encodeURIComponent(next)}`
    : `${siteUrl}/api/auth/callback`;

  return (
    <div className="space-y-4">
      {error && message && (
        <Alert className="bg-destructive/10 border-destructive/50 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Auth
        supabaseClient={createClient()}
        appearance={{ theme: brandTheme }}
        theme="dark"
        providers={providers}
        redirectTo={redirectUrl} // <-- USA LA URL MODIFICADA
        localization={localization}
        socialLayout="horizontal"
        view={defaultView}
      />
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Carga Diferida (Lazy Loading): El componente `Auth` de Supabase puede ser relativamente pesado. Podría ser cargado de forma dinámica (`next/dynamic`) para mejorar el LCP (Largest Contentful Paint) de la página de login, mostrando un esqueleto de carga mientras se inicializa.
 * 2. Integración con `react-hook-form`: Para los campos de email/contraseña, se podría reemplazar la gestión de estado interna de `@supabase/auth-ui-react` por `react-hook-form` para una validación en tiempo real más granular y una mejor integración con el resto de los formularios de la aplicación, aunque esto supone una complejidad mayor.
 * 3. Mapeo de Errores de API de Supabase: La UI de SupabaseAuth a veces muestra mensajes de error técnicos (`Error de red`, `Token inválido`). Una mejora sería interceptar los errores de `Auth` (a través de un `onAuthStateChange` listener o similar si se usa una implementación custom del formulario) y mapear sus códigos a mensajes de error traducidos y más amigables con `react-hot-toast`.
 */
// Ruta: app/[locale]/login/login-form.tsx
