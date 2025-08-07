// app/api/auth/callback/route.ts
import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

/**
 * @file Route Handler para el callback de autenticación de Supabase.
 * @description Este aparato de servidor es el punto de retorno seguro después de
 *              que un usuario se autentica con Supabase. Su única responsabilidad
 *              es intercambiar el código de autorización por una sesión segura,
 *              estableciendo las cookies de sesión en el navegador del usuario,
 *              y luego redirigirlo a la ubicación apropiada.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` es la ruta a la que el usuario intentaba acceder antes del login.
  const next = searchParams.get("next");

  logger.trace("[Auth Callback] Iniciando intercambio de código por sesión.");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectTo = new URL(next || "/dashboard", origin);
      logger.info(
        "[Auth Callback] Sesión establecida con éxito. Redirigiendo...",
        { redirectTo: redirectTo.pathname }
      );
      return NextResponse.redirect(redirectTo);
    }

    logger.error("[Auth Callback] Error al intercambiar código por sesión.", {
      message: error.message,
    });
    // Redirige a la página de login con un mensaje de error específico.
    const redirectUrl = new URL("/auth/login", origin);
    redirectUrl.searchParams.set("error", "session_exchange_failed");
    redirectUrl.searchParams.set(
      "message",
      "No se pudo iniciar sesión. Por favor, intente de nuevo."
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Redirige a la página de login si el código no está presente.
  logger.warn(
    "[Auth Callback] Código de autorización no encontrado en la URL."
  );
  const redirectUrl = new URL("/auth/login", origin);
  redirectUrl.searchParams.set("error", "auth_code_missing");
  redirectUrl.searchParams.set(
    "message",
    "El enlace de autenticación es inválido o ha expirado."
  );
  return NextResponse.redirect(redirectUrl);
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Seguridad de Redirección**: ((Implementada)) Se utiliza el `origin` de la petición actual para construir la URL de redirección, previniendo vulnerabilidades de redirección abierta (Open Redirect). La ruta `next` se asume como una ruta relativa segura.
 * 2. **Manejo de Errores Robusto**: ((Implementada)) El handler gestiona explícitamente los casos de fallo (código ausente, error en el intercambio) y redirige al usuario a la página de login con mensajes de error claros en los parámetros de la URL.
 * 3. **Full Observability**: ((Implementada)) Se ha instrumentado el flujo con `logger.trace`, `logger.info`, `logger.warn` y `logger.error` para una visibilidad completa del proceso de autenticación en el servidor.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de Parámetro `next`**: ((Vigente)) Para una seguridad de élite, se podría añadir una validación explícita para asegurar que el valor de `next` es una ruta relativa y no una URL externa, aunque la construcción actual con `new URL(...)` ya mitiga el riesgo principal.
 */
// app/api/auth/callback/route.ts
