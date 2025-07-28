// Ruta: app/api/auth/callback/route.ts
/**
 * @file route.ts
 * @description Manejador del Callback de Autenticación de Supabase (OAuth).
 * REFACTORIZACIÓN CRÍTICA: Se ha corregido la creación del cliente de Supabase
 * para que sea compatible con el contexto de los Route Handlers. Esto resuelve
 * el error de compilación `next/headers` y restaura el flujo de OAuth.
 *
 * @author Metashark
 * @version 4.1.0 (Route Handler Stability Fix)
 */
import { logger } from "@/lib/logging";
import type { Database } from "@/lib/types/database";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      logger.error(
        "Fallo en el intercambio de código de sesión de OAuth:",
        error
      );
      const errorUrl = new URL("/login?error=auth_failed", origin);
      return NextResponse.redirect(errorUrl);
    }
  }

  // --- Lógica de Redirección Inteligente y Segura ---
  let redirectPath = "/dashboard";
  if (next && next.startsWith("/")) {
    redirectPath = next;
  } else if (next) {
    logger.warn(
      `Intento de redirección abierta bloqueado. Parámetro 'next' inválido: ${next}`
    );
  }

  logger.success(
    `Callback de autenticación exitoso, redirigiendo a: ${redirectPath}`
  );
  const redirectUrl = new URL(redirectPath, origin);
  return NextResponse.redirect(redirectUrl);
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Flujo de Onboarding para Nuevos Usuarios: Tras un `exchangeCodeForSession` exitoso, consultar si es el primer inicio de sesión del usuario. Si es así, redirigirlo a una página `/welcome` en lugar de respetar el parámetro `next`.
 * 2. Registro de Eventos de Seguridad: Cada inicio de sesión exitoso vía callback debería ser registrado en una tabla de `audit_logs` con la IP del usuario, user agent y la hora para auditoría.
 * 3. Abstracción del Cliente Supabase: Centralizar la lógica de creación del cliente para Route Handlers en una función de utilidad en `lib/supabase/` para evitar la repetición de código.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción del Cliente Supabase: Centralizar la lógica de creación del cliente para Route Handlers en una función de utilidad en `lib/supabase/` para evitar la repetición de código.
 * 2. Servicio de Notificaciones Real: Reemplazar el `TODO` del comentario con una llamada real a un servicio de notificaciones (ej. Resend para emails, o una inserción en una tabla `notifications`) para la bienvenida de nuevos usuarios.
 * 3. Sincronización de Datos de Perfil: Tras el primer inicio de sesión con OAuth, el `profile` del usuario en nuestra tabla `profiles` podría no tener `full_name` o `avatar_url`. Este es el lugar ideal para sincronizar esos datos desde el proveedor de OAuth a nuestra base de datos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción del Cliente Supabase: La lógica para crear el cliente de Supabase para Route Handlers se repite en varios archivos. Podría abstraerse a una función de utilidad en `lib/supabase/` para centralizar la lógica y reducir la duplicación de código.
 * 2. Flujo de Onboarding: Tras una confirmación exitosa, se podría verificar si es el primer inicio de sesión del usuario. Si es así, se le podría redirigir a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard genérico.
 * 3. Notificación de Bienvenida: Al confirmar el correo, se podría disparar un evento (a una cola de trabajos o una función de base de datos) para enviar un correo de bienvenida al usuario, mejorando el engagement inicial.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Flujo de Onboarding para Nuevos Usuarios: Después de un `exchangeCodeForSession` exitoso, se podría consultar si es el primer inicio de sesión del usuario. Si es así, se podría forzar la redirección a `/welcome` en lugar de respetar el parámetro `next`, asegurando que todos los nuevos usuarios completen la configuración inicial.
 * 2. Registro de Eventos de Seguridad: Cada inicio de sesión exitoso vía callback debería ser registrado en una tabla de `audit_logs` con la IP del usuario, el user agent y la hora. Esto es crucial para la auditoría de seguridad.
 * 3. Abstracción del Cliente: Dado que la lógica de creación del cliente se repite en los tres Route Handlers refactorizados, se podría crear una función de utilidad `createSupabaseClientForRouteHandler(cookieStore)` en `lib/supabase/` para centralizarla.
 */
/* MEJORAS PROPUESTAS
 * 1. **Flujo de Onboarding para Nuevos Usuarios:** Después de un `exchangeCodeForSession` exitoso, se podría consultar la tabla `profiles` (o verificar metadatos de la sesión) para ver si es la primera vez que el usuario inicia sesión. Si es así, se podría forzar la redirección a `/welcome` en lugar de respetar el parámetro `next`, asegurando que todos los nuevos usuarios completen la configuración inicial.
 * 2. **Notificación de Bienvenida:** Tras un primer login exitoso, se podría disparar un evento (ej. a una cola de trabajos o directamente una función de base de datos) para enviar un correo electrónico de bienvenida al usuario, mejorando el engagement inicial.
 * 3. **Registro de Eventos de Seguridad:** Cada inicio de sesión exitoso (especialmente vía callback) debería ser registrado en una tabla de `audit_logs` con la IP del usuario, el user agent y la hora. Esto es crucial para la auditoría de seguridad y la detección de actividades sospechosas.
 * 1. **Validación de `next` (Open Redirect):** La redirección actual es vulnerable a "Open Redirect". Se debe implementar una validación para asegurar que el valor del parámetro `next` sea una ruta relativa interna (`/dashboard/settings`) y no un dominio externo malicioso (`//evil.com`).
 * 2. **Flujo de Onboarding para Nuevos Usuarios:** Después de un `exchangeCodeForSession` exitoso, se podría consultar la tabla `profiles` para ver si es la primera vez que el usuario inicia sesión. Si es así, se le podría redirigir a una página de onboarding `/welcome` en lugar de al dashboard genérico.
 * 3. **Pasar Parámetros de Error:** En caso de fallo, en lugar de un genérico `auth_failed`, se podría pasar un código de error más específico en la URL (`error.code`) para que la página de login pueda mostrar un mensaje más útil al usuario.
1.  **Redirección Dinámica (`next`):** El callback podría leer un parámetro `next` para redirigir a los usuarios a la página que intentaban acceder antes del login.
2.  **Flujo de Onboarding para Nuevos Usuarios:** Después del `exchangeCodeForSession`, verificar si es el primer inicio de sesión del usuario y redirigirlo a una página de bienvenida (`/welcome`).
1.  **Redirección Dinámica (`next`):** El callback podría leer un parámetro `next` en la URL de estado
 *    de OAuth para redirigir a los usuarios a la página que intentaban acceder antes de ser
 *    enviados al flujo de login (ej. `/dashboard/settings`), mejorando la UX.
2.  **Flujo de Onboarding para Nuevos Usuarios:** Después del `exchangeCodeForSession`, se podría
 *    verificar si es el primer inicio de sesión del usuario. Si es así, redirigirlo a una
 *    página de bienvenida o de configuración de perfil (`/welcome`) en lugar del dashboard general.
*/
