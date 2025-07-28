// Ruta: app/api/auth/callback/confirm/route.ts
/**
 * @file route.ts
 * @description Manejador del callback para la confirmación de email de Supabase.
 * REFACTORIZACIÓN CRÍTICA: Se ha reemplazado la importación del cliente de servidor
 * por una implementación local compatible con Route Handlers, utilizando `cookies()`
 * de `next/headers`. Esto resuelve el error de compilación fundamental. Se ha
 * añadido también validación de seguridad para la redirección.
 *
 * @author Metashark
 * @version 4.1.0 (Route Handler Stability & Security)
 */
import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
      logger.success(
        `Email confirmado exitosamente. Redirigiendo a: ${safeNextPath}`
      );
      return NextResponse.redirect(`${origin}${safeNextPath}`);
    }

    logger.error("Error al intercambiar código de confirmación:", error);
  }

  const redirectUrl = new URL("/login", origin);
  redirectUrl.searchParams.set("error", "confirmation-failed");
  redirectUrl.searchParams.set(
    "message",
    "El enlace de confirmación no es válido o ha expirado."
  );
  return NextResponse.redirect(redirectUrl);
}

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
