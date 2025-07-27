/* Ruta: app/[locale]/login/login-form.tsx */

"use client";

import { createClient } from "@/lib/supabase/client";
import { brandTheme } from "@/lib/supabase/auth-theme";
import { Auth } from "@supabase/auth-ui-react";
import type { Provider } from "@supabase/supabase-js";

/**
 * @file login-form.tsx
 * @description Componente de Cliente para el Formulario de Autenticación de Supabase.
 * REFACTORIZACIÓN DE ROBUSTEZ: Se ha modificado la construcción de la `redirectUrl`
 * para que dependa de una única y canónica variable de entorno `NEXT_PUBLIC_SITE_URL`.
 * Esto previene errores de redirección a `localhost` en entornos de producción
 * y hace la configuración más explícita y segura.
 *
 * @author Metashark
 * @version 5.0.0 (Canonical URL Refactor)
 */

/**
 * @description Lee las variables de entorno para determinar qué proveedores de OAuth mostrar.
 * @returns {Provider[]} Un array de strings de proveedores válidos para Supabase.
 */
function getOAuthProviders(): Provider[] {
  const providersEnv = process.env.NEXT_PUBLIC_OAUTH_PROVIDERS || "google";
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

export function LoginForm({ localization }: { localization: any }) {
  const providers = getOAuthProviders();

  // CORRECCIÓN: La URL de redirección ahora se construye de forma segura.
  // Es IMPERATIVO que la variable NEXT_PUBLIC_SITE_URL esté configurada en Vercel.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    // Esto mostrará un error claro en la consola si la variable no está configurada.
    console.error(
      "FATAL: NEXT_PUBLIC_SITE_URL environment variable is not set."
    );
    // Opcionalmente, podrías renderizar un mensaje de error aquí.
  }
  const redirectUrl = siteUrl ? `${siteUrl}/api/auth/callback` : undefined;

  return (
    <Auth
      supabaseClient={createClient()}
      appearance={{ theme: brandTheme }}
      theme="dark"
      providers={providers}
      redirectTo={redirectUrl}
      localization={localization}
      socialLayout="horizontal"
    />
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Manejo de Errores desde la URL: Este componente podría leer los parámetros de error de la URL (ej. `?error=...`) utilizando `useSearchParams` y mostrar un componente `<Alert>` con un mensaje de error traducido, proporcionando un feedback más claro al usuario.
 * 2. Vista por Defecto Dinámica: Añadir una prop `defaultView` al componente para que la página contenedora decida si el formulario debe mostrar "Sign In" o "Sign Up" por defecto (ej. para rutas `/login` vs `/signup`).
 * 3. Fallback de URL Grácil: En lugar de un `console.error`, se podría renderizar un estado de error en la UI si `NEXT_PUBLIC_SITE_URL` no está definida, informando al administrador del sitio de la mala configuración.
 */
/* Ruta: app/[locale]/login/login-form.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Manejo de Errores desde la URL: Este componente podría leer los parámetros de error de la URL (ej. `?error=confirmation-failed`) utilizando el hook `useSearchParams`. Si se detecta un error, podría mostrar un componente `<Alert>` de Shadcn/UI con un mensaje de error traducido, proporcionando un feedback mucho más claro al usuario que una simple redirección.
 * 2. Pasar Parámetro `next` a `redirectTo`: Para implementar la redirección post-login inteligente sugerida en el `page.tsx`, este componente debería leer el parámetro `next` de la URL y añadirlo dinámicamente a la URL `redirectTo`, asegurando que Supabase lo preserve a través del flujo de OAuth.
 * 3. Vista por Defecto Dinámica: Añadir una prop `defaultView` al componente (`"sign_in"` | `"sign_up"`). Esto permitiría a la página contenedora decidir si el formulario debe mostrar "Sign In" o "Sign Up" por defecto, lo que permitiría crear rutas separadas como `/login` y `/signup` que reutilizarían este mismo componente.
 */
/* MEJORAS PROPUESTAS
 * 1. **Manejo de Errores de la URL:** Este componente podría leer los parámetros de error de la URL (ej. `?error=auth_failed`) y mostrar un componente `<Alert>` de Shadcn/UI con un mensaje de error traducido, proporcionando un feedback más claro al usuario.
 * 2. **Pasar Parámetro `next` a `redirectTo`:** Para implementar la redirección post-login inteligente, se debería leer el parámetro `next` de la URL actual y añadirlo a la URL `redirectTo`, asegurando que Supabase lo preserve a través del flujo de OAuth.
 * 3. **Vista por Defecto Dinámica:** Añadir una prop `defaultView` al componente que permita a la página contenedora decidir si el formulario debe mostrar "Sign In" o "Sign Up" por defecto (ej. `/login` vs `/signup`).
1.  **Tema Personalizado Completo:** Crear un objeto de tema (`const brandTheme: Theme = { ... }`) y pasarlo a la prop `theme` en lugar de `ThemeSupa` y `variables`. Esto permite un control más granular y limpio sobre la apariencia del componente de autenticación.
2.  **Validación de Variables de Entorno:** Utilizar Zod para validar las variables de entorno (`NEXT_PUBLIC_ROOT_URL`, `NEXT_PUBLIC_OAUTH_PROVIDERS`) al iniciar la aplicación, previniendo errores de configuración en tiempo de ejecución.
3.  **Feedback de Carga:** Envolver el componente `Auth` en un `<Suspense>` o similar para mostrar un esqueleto de carga mientras la librería se inicializa, mejorando la percepción de rendimiento.
1.  **Tema Personalizado:** Reemplazar `ThemeSupa` por un tema personalizado que se alinee con los estilos de Shadcn/UI para una experiencia de usuario más cohesiva.
2.  **Validación de Variables de Entorno:** Utilizar Zod para validar `NEXT_PUBLIC_ROOT_DOMAIN` y `NEXT_PUBLIC_ROOT_URL` al iniciar la aplicación, previniendo errores si no están definidos.
3.  **Feedback de Carga:** Envolver el componente `Auth` en un `<Suspense>` para mostrar un esqueleto de carga mientras la librería se inicializa.
1.  **Tema Personalizado:** Reemplazar `ThemeSupa` por un tema personalizado que se alinee con los estilos de Shadcn/UI.
2.  **Validación de Variables de Entorno:** Usar Zod para validar `NEXT_PUBLIC_ROOT_DOMAIN`.
3.  **Feedback de Carga:** Envolver el componente `Auth` en un `<Suspense>` para mostrar un esqueleto de carga.
 * 1. **Tema Personalizado:** Reemplazar `ThemeSupa` por un tema personalizado que se alinee con los estilos de Shadcn/UI.
 * 2. **Validación de Variables de Entorno:** Utilizar Zod para validar `NEXT_PUBLIC_ROOT_URL` al iniciar la aplicación, previniendo errores si no está definida.
 * 3. **Feedback de Carga:** Envolver el componente `Auth` en un `<Suspense>` para mostrar un esqueleto de carga mientras se inicializa.
 * 1. **Tema Personalizado:** Reemplazar `ThemeSupa` por un tema personalizado que se alinee con los estilos de Shadcn/UI para una experiencia de usuario más cohesiva.
 * 2. **Variables de Entorno Validadas:** Utilizar Zod para validar las variables de entorno al iniciar la aplicación, asegurando que `NEXT_PUBLIC_OAUTH_PROVIDERS` contenga valores válidos y previniendo errores en tiempo de ejecución.
 * 3. **Feedback de Carga:** Envolver el componente `Auth` en un `<Suspense>` o similar para mostrar un esqueleto de carga mientras la librería se inicializa, mejorando la percepción de rendimiento.
 */
/* MEJORAS PROPUESTAS
 * 1. **Tema Personalizado:** Reemplazar `ThemeSupa` por un tema personalizado que se alinee con los estilos de Shadcn/UI para una experiencia de usuario más cohesiva.
 * 2. **Paso de Clientes:** En lugar de crear un nuevo cliente de Supabase aquí, la página del servidor podría crear la instancia y pasarla como prop para un mejor control.
 */
