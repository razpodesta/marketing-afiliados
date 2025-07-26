// Ruta: app/api/auth/callback/reset-password/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * @file route.ts
 * @description Endpoint que maneja la actualización de contraseña.
 * Este endpoint es invocado por el cliente de Supabase Auth cuando el usuario
 * envía el formulario de nueva contraseña.
 *
 * @author Metashark
 * @version 2.0.0 (Supabase Native Architecture)
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  // El cliente de Supabase gestiona la sesión a partir de las cookies.
  // El método updateUser solo funcionará si hay una sesión válida de "recuperación".
  const { data, error } = await supabase.auth.updateUser({
    password: (await request.json()).password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json(data);
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Validación Robusta:** Mejorar la validación de la contraseña usando `zod`.
2.  **Migración a Server Action:** Este flujo puede ser manejado enteramente por una Server Action, eliminando la necesidad de este endpoint de API.
1.  **Activar Lógica de Supabase:** La mejora principal es descomentar y activar la lógica de `updateUser` una vez que la migración a Supabase esté completa.
2.  **Validación Robusta:** Mejorar la validación de la contraseña usando `zod` para comprobar la complejidad (mayúsculas, números, símbolos) además de la longitud.
3.  **Prevención de CSRF:** Aunque Next.js ofrece cierta protección, si esta ruta se mantiene, asegurarse de que se implementen medidas contra CSRF, o preferiblemente, migrar la lógica a una Server Action que tiene protección integrada.
*/
