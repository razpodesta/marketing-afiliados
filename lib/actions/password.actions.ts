// lib/actions/password.actions.ts
/**
 * @file lib/actions/password.actions.ts
 * @description Aparato canónico para las Server Actions de contraseñas.
 *              Refactorizado para seguir el flujo de seguridad canónico anti-enumeración,
 *              eliminando la verificación previa de usuario y resolviendo todos los
 *              errores de compilación.
 * @author L.I.A. Legacy & RaZ Podestá
 * @version 8.0.0 (Canonical Anti-Enumeration Security Flow)
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { EmailSchema, type RequestPasswordResetState } from "@/lib/validators";

import { createAuditLog, EmailService, rateLimiter } from "./_helpers";

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormState = { error: string | null; success: boolean };

export async function requestPasswordResetAction(
  prevState: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";
  const limit = await rateLimiter.check(ip, "password_reset");

  if (!limit.success) {
    return {
      error:
        limit.error || "Demasiadas solicitudes. Intente nuevamente más tarde.",
    };
  }

  const email = formData.get("email");
  const validation = EmailSchema.safeParse(email);
  if (!validation.success) {
    return { error: "Por favor, introduce un email válido." };
  }

  const validatedEmail = validation.data;
  const adminSupabase = createAdminClient();

  // --- INICIO DE REFACTORIZACIÓN DE SEGURIDAD CANÓNICA ---
  // No verificamos si el usuario existe para prevenir ataques de enumeración.
  // Llamamos a generateLink incondicionalmente. Supabase manejará el resto.
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email: validatedEmail,
  });

  if (error) {
    // Solo registramos el error en el servidor. No revelamos nada al cliente.
    logger.error(
      `[PasswordActions] Error al generar link para ${validatedEmail}:`,
      error
    );
  } else {
    // Si la generación fue exitosa (lo que no significa que el usuario exista),
    // procedemos a enviar el email. EmailService enviará el correo solo si
    // el enlace es válido.
    await EmailService.sendPasswordResetEmail(
      validatedEmail,
      data.properties.action_link
    );
  }

  // Registramos el intento de auditoría.
  await createAuditLog("password_reset_request", {
    targetEmail: validatedEmail,
  });
  // --- FIN DE REFACTORIZACIÓN DE SEGURIDAD CANÓNICA ---

  // Siempre redirigimos a la misma página para no dar información al atacante.
  redirect("/auth-notice?message=check-email-for-reset");
}

export async function updatePasswordAction(
  prevState: UpdatePasswordFormState,
  formData: FormData
): Promise<UpdatePasswordFormState> {
  const validation = ResetPasswordSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validation.success) {
    const formErrors = validation.error.flatten().fieldErrors;
    const errorMessage =
      formErrors.password?.[0] ||
      formErrors.confirmPassword?.[0] ||
      "Datos inválidos.";
    return { error: errorMessage, success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "Sesión de recuperación inválida o expirada. Por favor, solicita un nuevo link.",
      success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    logger.error(
      `[PasswordActions] Error al actualizar la contraseña para ${user.id}:`,
      error.message
    );
    if (error.message.includes("token has expired")) {
      return {
        error: "El link de reseteo ha expirado. Por favor, solicita uno nuevo.",
        success: false,
      };
    }
    return {
      error: "No fue posible actualizar la contraseña. Tente nuevamente.",
      success: false,
    };
  }

  await createAuditLog("password_reset_success", { userId: user.id });
  await supabase.auth.signOut({ scope: "others" });

  return { error: null, success: true };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Flujo de Seguridad Anti-Enumeración**: ((Implementada)) Se ha eliminado la verificación de existencia de usuario, alineando la acción con las mejores prácticas de seguridad para prevenir ataques de enumeración de usuarios. Esto resuelve todos los errores de compilación.
 */
// lib/actions/password.actions.ts
