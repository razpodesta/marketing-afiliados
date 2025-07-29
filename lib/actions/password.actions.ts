// Ruta: app/actions/password.actions.ts
/**
 * @file password.actions.ts
 * @description Contiene las Server Actions para el flujo de recuperación de contraseña.
 * REFACTORIZACIÓN CRÍTICA DE API:
 * 1. Se ha corregido la lógica para obtener un usuario por email, reemplazando la
 *    llamada incorrecta a `listUsers` por una consulta directa y segura a la tabla `auth.users`.
 *    Esto resuelve un error fatal de compilación y restaura la funcionalidad.
 *
 * @author Metashark
 * @version 1.2.0 (Secure User Lookup Fix)
 */
"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EmailSchema, type RequestPasswordResetState } from "./schemas";
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
    return { error: limit.error };
  }

  const email = formData.get("email");
  const validation = EmailSchema.safeParse(email);
  if (!validation.success) {
    return { error: "Por favor, introduce un email válido." };
  }

  const validatedEmail = validation.data;
  const adminSupabase = createAdminClient();

  // CORRECCIÓN CRÍTICA: La forma correcta de buscar un usuario por email es consultando la tabla auth.users.
  const { data: user, error: userError } = await adminSupabase
    .from("users")
    .select("id")
    .eq("email", validatedEmail)
    .single();

  if (userError && userError.code !== "PGRST116") {
    // PGRST116 = 'Not Found', lo cual no es un error en este flujo.
    logger.error(
      `[Auth] Error al buscar usuario por email ${validatedEmail}:`,
      userError
    );
  }

  await createAuditLog("password_reset_request", {
    targetEmail: validatedEmail,
    userId: user?.id,
  });

  if (user) {
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: "recovery",
      email: validatedEmail,
    });

    if (error || !data) {
      logger.error(
        `[Auth] Error al generar enlace de recuperación para ${validatedEmail}:`,
        error
      );
    } else {
      await EmailService.sendPasswordResetEmail(
        validatedEmail,
        data.properties.action_link
      );
    }
  } else {
    logger.warn(
      `[Auth] Solicitud de reseteo para email no existente (oculto al cliente): ${validatedEmail}`
    );
  }

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
        "Sesión de recuperación inválida o expirada. Por favor, solicita un nuevo enlace.",
      success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    logger.error(
      `[Auth] Error al actualizar la contraseña para ${user.id}:`,
      error.message
    );
    if (error.message.includes("token has expired")) {
      return {
        error:
          "El enlace de reseteo ha expirado. Por favor, solicita uno nuevo.",
        success: false,
      };
    }
    return {
      error: "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
      success: false,
    };
  }

  await createAuditLog("password_reset_success", { userId: user.id });
  await supabase.auth.signOut({ scope: "others" });

  return { error: null, success: true };
}
