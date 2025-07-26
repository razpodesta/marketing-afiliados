/* Ruta: app/api/auth/callback/route.ts */

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * @file route.ts
 * @description Manejador del Callback de Autenticación de Supabase (OAuth).
 * MEJORA DE UX: Ahora lee el parámetro `next` de la URL para redirigir al
 * usuario a la página que intentaba acceder antes del login.
 * MEJORA DE SEGURIDAD: Se ha añadido una validación estricta para el parámetro
 * `next` para prevenir vulnerabilidades de "Open Redirect".
 *
 * @author Metashark
 * @version 3.0.0 (Smart & Secure Redirection)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      logger.error("Fallo en el intercambio de código de sesión:", error);
      const errorUrl = new URL("/login?error=auth_failed", origin);
      return NextResponse.redirect(errorUrl);
    }
  }

  // --- Lógica de Redirección Inteligente y Segura ---
  let redirectPath = "/dashboard"; // Ruta por defecto si `next` es inválido o no existe.

  if (next) {
    // MEJORA DE SEGURIDAD: Validar que `next` sea una ruta relativa interna.
    // Esto previene que un atacante cree un enlace de login que redirija
    // a un sitio malicioso después de la autenticación.
    if (next.startsWith("/")) {
      redirectPath = next;
    } else {
      logger.warn(
        `Intento de redirección abierta bloqueado. Parámetro 'next' inválido: ${next}`
      );
    }
  }

  logger.success(
    `Callback de autenticación exitoso, redirigiendo a: ${redirectPath}`
  );
  const redirectUrl = new URL(redirectPath, origin);
  return NextResponse.redirect(redirectUrl);
}
/* Ruta: app/api/auth/callback/route.ts */

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
