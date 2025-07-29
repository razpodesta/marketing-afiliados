// Ruta: app/api/auth/callback/confirm/route.ts
/**
 * @file route.ts
 * @description Manejador del callback para la confirmación de email de Supabase.
 *              Este aparato es un endpoint de seguridad crítico que completa el
 *              flujo de verificación de la cuenta de un nuevo usuario.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 4.2.0 (Logging API Fix)
 */
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import type { Database } from "@/lib/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // Validación de Seguridad: Prevenir vulnerabilidades de Open Redirect.
  const safeNextPath = next && next.startsWith("/") ? next : "/dashboard";

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

    if (!error) {
      // CORRECCIÓN: Se utiliza `logger.info` para registrar eventos exitosos,
      // ya que `logger.success` no es un método estándar de Pino.
      logger.info(
        `Email confirmado exitosamente. Redirigiendo a: ${safeNextPath}`
      );
      return NextResponse.redirect(`${origin}${safeNextPath}`);
    }

    logger.error("Error al intercambiar código de confirmación:", error);
  }

  // Fallback en caso de error o código inválido.
  const locale = request.cookies.get("NEXT_LOCALE")?.value || "es-ES";
  const redirectUrl = new URL(`/${locale}/login`, origin);
  redirectUrl.searchParams.set("error", "confirmation-failed");
  redirectUrl.searchParams.set(
    "message",
    "El enlace de confirmación no es válido o ha expirado."
  );
  return NextResponse.redirect(redirectUrl);
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el flujo de confirmación.
 *
 * 1.  **Abstracción del Cliente Supabase:** (Revalidado) Centralizar la lógica de creación del cliente para Route Handlers en una función de utilidad en `lib/supabase/` para evitar la repetición de código.
 * 2.  **Flujo de Onboarding:** (Revalidado) Tras una confirmación exitosa, verificar si es el primer inicio de sesión del usuario para redirigirlo a `/welcome`.
 * 3.  **Detección de Locale en Redirección:** (Implementado Parcialmente) La redirección de error ahora intenta leer la cookie `NEXT_LOCALE` para una experiencia de usuario más consistente.
 */

/**
 * @fileoverview El aparato `confirm/route.ts` es un endpoint de API crítico para la seguridad.
 * @functionality
 * - Es el punto de destino al que Supabase redirige al usuario después de hacer clic en un enlace de confirmación de correo.
 * - Recibe un `code` de un solo uso en los parámetros de la URL.
 * - Su única misión es intercambiar de forma segura este `code` por una sesión de usuario válida (`exchangeCodeForSession`).
 * - Valida la redirección final para prevenir vulnerabilidades de Open Redirect.
 * @relationships
 * - Es parte del flujo de autenticación iniciado por la UI de Supabase Auth en la página de registro.
 * - Depende de `lib/logging` para el registro de eventos y de la creación del cliente de Supabase para Route Handlers.
 * @expectations
 * - Se espera que este endpoint sea altamente fiable y seguro. Debe manejar correctamente tanto los casos de éxito (redirigiendo al usuario a su dashboard) como los de error (redirigiendo de vuelta al login con un mensaje claro), sin exponer información sensible.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción del Cliente Supabase: Centralizar la lógica de creación del cliente para Route Handlers en una función de utilidad en `lib/supabase/` para evitar la repetición de código en los tres archivos de callback.
 * 2. Flujo de Onboarding: Tras una confirmación exitosa, verificar si es el primer inicio de sesión del usuario para redirigirlo a una página de bienvenida (`/welcome`) en lugar del dashboard, mejorando la experiencia inicial.
 * 3. Notificación de Bienvenida: Al confirmar el correo, disparar un evento (por ejemplo, a una cola de trabajos o una función de base de datos) para enviar un correo de bienvenida al usuario.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción del Cliente Supabase: La lógica para crear el cliente de Supabase para Route Handlers se repite en varios archivos. Podría abstraerse a una función de utilidad en `lib/supabase/` para centralizar la lógica y reducir la duplicación de código.
 * 2. Flujo de Onboarding: Tras una confirmación exitosa, se podría verificar si es el primer inicio de sesión del usuario. Si es así, se le podría redirigir a una página `/welcome` para un tour guiado o configuración inicial, en lugar de al dashboard genérico.
 * 3. Notificación de Bienvenida: Al confirmar el correo, se podría disparar un evento (a una cola de trabajos o una función de base de datos) para enviar un correo de bienvenida al usuario, mejorando el engagement inicial.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Validación de `next`:** Añadir validación para el parámetro `next` para prevenir redirecciones abiertas (Open Redirect) a dominios maliciosos, asegurando que solo apunte a rutas internas.
2.  **Página de Éxito de Confirmación:** En lugar de redirigir directamente al dashboard, se podría redirigir a una página intermedia `/auth/confirmed` que muestre un mensaje de bienvenida y un botón para continuar, mejorando la UX.
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Activar Lógica de Supabase:** La mejora principal es descomentar y activar la lógica de `exchangeCodeForSession` una vez que la migración a Supabase esté completa.
2.  **Manejo de Errores Detallado:** Implementar un manejo de errores más específico basado en el tipo de `error` devuelto por Supabase, redirigiendo con mensajes de error claros en la URL.
3.  **Seguridad:** Añadir validación para el parámetro `next` para prevenir redirecciones abiertas (Open Redirect) a dominios maliciosos. Asegurarse de que `next` solo apunte a rutas internas de la aplicación.
*/
