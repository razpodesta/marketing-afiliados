// lib/actions/password.actions.ts
/**
 * @file lib/actions/password.actions.ts
 * @description Aparato canónico y Única Fuente de Verdad para las Server Actions
 *              del flujo de recuperación y reseteo de contraseñas.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 3.0.0 (Canonical & Secure Implementation)
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

/**
 * @async
 * @function requestPasswordResetAction
 * @description Inicia el flujo de reseteo de contraseña. Incluye rate limiting,
 *              auditoría y es agnóstico a la existencia del email para prevenir
 *              la enumeración de usuarios, una práctica de seguridad crítica.
 * @param {RequestPasswordResetState} prevState - El estado anterior del formulario, compatible con `useFormState`.
 * @param {FormData} formData - Datos del formulario, debe contener 'email'.
 * @returns {Promise<RequestPasswordResetState>} El nuevo estado del formulario o una redirección.
 */
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

  const { data: user, error: userError } = await adminSupabase
    .from("users")
    .select("id")
    .eq("email", validatedEmail)
    .single();

  if (userError && userError.code !== "PGRST116") {
    logger.error(
      `[PasswordActions] Error al buscar usuario ${validatedEmail}:`,
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
        `[PasswordActions] Error al generar link para ${validatedEmail}:`,
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
      `[PasswordActions] Solicitud de reseteo para email no existente (oculto al cliente): ${validatedEmail}`
    );
  }

  redirect("/auth-notice?message=check-email-for-reset");
}

/**
 * @async
 * @function updatePasswordAction
 * @description Actualiza la contraseña del usuario autenticado en un flujo de recuperación.
 *              Valida la nueva contraseña y, en caso de éxito, invalida todas las demás
 *              sesiones activas del usuario como medida de seguridad.
 * @param {UpdatePasswordFormState} prevState - El estado anterior del formulario.
 * @param {FormData} formData - Datos del formulario con la nueva contraseña y su confirmación.
 * @returns {Promise<UpdatePasswordFormState>} El nuevo estado del formulario.
 */
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
 * @description Mejoras para evolucionar el sistema de gestión de contraseñas.
 *
 * @subsection Mejoras Futuras
 * 1. **Implementación Real de `rateLimiter` y `EmailService`**: ((Vigente)) Reemplazar las simulaciones actuales por clientes reales (ej. Upstash Redis para rate limiting, Resend para emails).
 * 2. **Prevención de Reutilización de Contraseña**: ((Vigente)) Para seguridad de nivel empresarial, `updatePasswordAction` podría consultar un hash de las N contraseñas anteriores del usuario para prevenir la reutilización.
 * 3. **Internacionalización de Mensajes de Error de Zod**: ((Vigente)) Integrar `zod-i18n` para que los mensajes de error del esquema de validación se traduzcan automáticamente según el idioma del usuario.
 */
// lib/actions/password.actions.ts
