// Ruta: app/api/auth/callback/reset-password/route.ts
/**
 * @file route.ts
 * @description Endpoint que maneja la actualización de contraseña.
 * REFACTORIZACIÓN CRÍTICA: Se ha corregido la creación del cliente de Supabase
 * para que sea compatible con el contexto de los Route Handlers, resolviendo el
 * error de compilación. Se añade validación de entrada con Zod para mayor seguridad.
 *
 * @author Metashark
 * @version 3.1.0 (Route Handler Stability & Security)
 */
import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Database } from "@/lib/types/database";

const PasswordUpdateSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = PasswordUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors.password?.[0] },
      { status: 400 }
    );
  }

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

  const { data, error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json(data);
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Migración a Server Action: Este flujo debería ser manejado por una Server Action para simplificar la arquitectura, eliminar este endpoint de API y obtener protección CSRF de forma nativa.
 * 2. Indicador de Fortaleza de Contraseña: El esquema de Zod puede hacerse más complejo para verificar la fortaleza de la contraseña (mayúsculas, números, símbolos) y proporcionar feedback más detallado.
 * 3. Rate Limiting: Implementar limitación de tasa basada en IP para prevenir ataques de fuerza bruta contra este endpoint.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Migración a Server Action: Para alinear este flujo con la arquitectura moderna de la aplicación, el formulario de `reset-password/page.tsx` debería ser refactorizado para usar una Server Action. Esto eliminaría la necesidad de este endpoint de API, simplificaría el código del cliente, y proporcionaría protección CSRF integrada.
 * 2. Indicador de Fortaleza de Contraseña: El esquema de Zod podría hacerse más complejo para verificar la fortaleza de la contraseña (mayúsculas, números, símbolos) y proporcionar un feedback más detallado en caso de error.
 * 3. Rate Limiting: Implementar un sistema de limitación de tasa (rate limiting) basado en IP o en ID de usuario (si la sesión de recuperación lo permite) para prevenir ataques de fuerza bruta contra este endpoint.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Validación Robusta con Zod: Antes de llamar a `updateUser`, el cuerpo de la petición debería ser validado con un esquema de Zod para asegurar que la contraseña cumple con los requisitos de complejidad (longitud, caracteres especiales, etc.).
 * 2. Migración a Server Action: Este flujo puede ser manejado enteramente por una Server Action vinculada al formulario en `reset-password/page.tsx`. Esto eliminaría la necesidad de este endpoint de API, simplificaría el código y se alinearía mejor con la arquitectura del resto de la aplicación.
 * 3. Prevención de CSRF: Aunque Next.js ofrece protección, si esta ruta se mantiene, asegurarse de que se implementen medidas contra CSRF. La migración a una Server Action es la mejor forma de lograrlo.
 */
