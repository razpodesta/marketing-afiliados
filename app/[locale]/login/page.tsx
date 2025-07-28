// Ruta: app/[locale]/login/page.tsx
/**
 * @file app/[locale]/login/page.tsx
 * @description Página de inicio de sesión principal (Server Component).
 * REFACTORIZACIÓN MENOR: Se ha actualizado la llamada a `LoginForm` para
 * pasar la prop `defaultView`, alineándose con las mejoras del componente hijo.
 *
 * @author Metashark
 * @version 4.1.0 (Dynamic View Prop)
 */
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("LoginPage");
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect("/dashboard");
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
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-lg">
        <CardContent className="pt-6">
          <LoginForm localization={localization} defaultView="sign_in" />
        </CardContent>
      </Card>
    </main>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Gestión del Parámetro `next` para Redirección Inteligente: Este componente podría leer un parámetro de búsqueda `next` de la URL (ej. `/login?next=/dashboard/settings`). Este parámetro podría ser pasado al `LoginForm` para que lo añada a la prop `redirectTo` de Supabase, asegurando que después del login, el usuario sea redirigido a la página que intentaba acceder originalmente.
 * 2. Esqueleto de Carga con Suspense: Envolver la `<Card>` en un `<Suspense>` de React con un `fallback` que muestre un esqueleto de carga del formulario. Esto mejoraría la experiencia de usuario percibida (LCP) mientras se ejecuta la lógica de `getSession` en el servidor.
 * 3. Rutas Separadas para Sign Up: Crear una ruta `/signup` que renderice este mismo componente pero pase `defaultView="sign_up"` a `LoginForm`, proporcionando URLs semánticas distintas para el registro y el inicio de sesión.
 */
/* Ruta: app/[locale]/login/page.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Gestión del Parámetro `next` para Redirección Inteligente: Este componente podría leer un parámetro de búsqueda `next` de la URL (ej. `/login?next=/dashboard/settings`). Este parámetro podría ser pasado al `LoginForm` y, a su vez, a la prop `redirectTo` de Supabase, asegurando que después de un inicio de sesión exitoso, el usuario sea redirigido a la página que intentaba acceder originalmente, en lugar de siempre a `/dashboard`.
 * 2. Esqueleto de Carga con Suspense: Envolver la `<Card>` que contiene el `LoginForm` en un `<Suspense>` de React con un `fallback` que muestre un esqueleto de carga del formulario. Esto mejoraría la experiencia de usuario percibida (LCP) mientras se ejecuta la lógica de `getSession` en el servidor.
 * 3. Metadatos de Página Dinámicos: Utilizar la función `generateMetadata` de Next.js en este archivo para establecer el título de la página de forma dinámica usando las traducciones (ej. `t('metadataTitle')`). Esto es una mejor práctica para el SEO y la accesibilidad, en lugar de depender únicamente de los metadatos globales del layout raíz.
 */
/* MEJORAS PROPUESTAS
 * 1. **Componente de Carga con Suspense:** Envolver la `<Card>` en un `<Suspense>` de React con un `fallback` que muestre un esqueleto de carga (skeleton). Esto mejoraría la experiencia de usuario percibida mientras se verifica la sesión del servidor.
 * 2. **Metadatos de Página Dinámicos:** Utilizar la función `generateMetadata` para establecer el título de la página de forma dinámica usando las traducciones, lo cual es una mejor práctica para el SEO y la accesibilidad.
 * 3. **Gestión del Parámetro `next`:** Leer el parámetro de búsqueda `next` en este componente del servidor y pasarlo como prop a `LoginForm`. `LoginForm` podría entonces añadirlo a la `redirectTo` URL de Supabase, completando el flujo de redirección inteligente.
1.  **Tema Personalizado para Auth UI:** Crear un tema que coincida con la estética de Shadcn/UI.
2.  **Manejo de Errores de OAuth:** Implementar una página de error de autenticación.
3.  **Flujo de Onboarding Post-Registro:** Usar "Auth Hooks" de Supabase para redirigir a los nuevos usuarios a `/welcome`.
1.  **Añadir Más Proveedores:** Integrar fácilmente más proveedores (GitHub, Apple) simplemente añadiendo más componentes `SignInButton` con el ID del proveedor correspondiente.
2.  **Formulario de Login con Contraseña:** Reintroducir un formulario de login con email/contraseña que utilice el `Credentials Provider` conectado a Supabase, ofreciendo una alternativa a OAuth.
3.  **Accesibilidad (A11y):** Añadir iconos SVG para cada proveedor de OAuth dentro de los botones y asegurarse de que tengan el `aria-label` adecuado para lectores de pantalla.
 * 1. **Manejo de Errores de Redirección:** Si un proveedor OAuth redirige con un parámetro de error en la URL, esta página podría leerlo y pasar un mensaje de error al `LoginForm` para mostrarlo al usuario.
 * 2. **Página de Carga (Loading UI):** Añadir un archivo `loading.tsx` en esta misma carpeta para mostrar un esqueleto de carga mientras se verifica la sesión del servidor, mejorando la experiencia de usuario percibida.
 * 1. **Tema Personalizado para Auth UI:** Crear un tema que coincida con la estética de Shadcn/UI.
 * 2. **Manejo de Errores de OAuth:** Implementar una página de error de autenticación.
 * 3. **Flujo de Onboarding Post-Registro:** Redirigir a los nuevos usuarios a una página de bienvenida.
 * 1. **Tema Personalizado para Auth UI:** Crear un tema que coincida con la estética de Shadcn/UI, en lugar de usar `ThemeSupa`.
 * 2. **Manejo de Errores de OAuth:** Implementar una página de error de autenticación a la que Supabase pueda redirigir si un proveedor de OAuth devuelve un error.
 * 3. **Flujo de Onboarding Post-Registro:** Utilizar los "Auth Hooks" de Supabase para redirigir a los nuevos usuarios a una página de onboarding (`/welcome`) después de su primer inicio de sesión.
 * 1. **Tema Personalizado para Auth UI:** Crear un tema personalizado para `@supabase/auth-ui-react` que coincida perfectamente con la estética de Shadcn/UI, en lugar de usar `ThemeSupa`.
 * 2. **Manejo de Errores de OAuth:** Implementar una página de error de autenticación a la que Supabase pueda redirigir si un proveedor de OAuth devuelve un error.
 * 3. **Flujo de Onboarding Post-Registro:** Utilizar los "Auth Hooks" de Supabase para redirigir a los nuevos usuarios a una página de onboarding (`/welcome`) después de su primer inicio de sesión para configurar su perfil o workspace.
 * 1. **OAuth como Opción Principal:** Integrar botones de "Iniciar Sesión con Google/GitHub" para una UX superior.
 * 2. **Enlace "Olvidé mi contraseña":** Añadir un `Link` para un futuro flujo de recuperación de contraseña.
 * 3. **Redirección Post-Login Inteligente:** Mejorar la redirección para que, si un usuario intentó acceder a una página protegida, sea devuelto a esa página después del login, usando el parámetro `callbackUrl`.
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
