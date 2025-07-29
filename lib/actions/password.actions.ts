// lib/actions/password.actions.ts
/**
 * @file lib/actions/password.actions.ts
 * @description Contém as Server Actions para o fluxo de recuperação e redefinição de senha.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 1.3.0 (Helper and Schema Imports Correction)
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { EmailSchema, type RequestPasswordResetState } from "@/lib/validators"; // <-- CORREÇÃO: Importar de lib/validators

import { createAuditLog, EmailService, rateLimiter } from "./_helpers"; // <-- CORREÇÃO: Importar do barrel file de helpers

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormState = { error: string | null; success: boolean };

/**
 * @async
 * @function requestPasswordResetAction
 * @description Solicita um link de redefinição de senha para o e-mail fornecido.
 *              Inclui controle de taxa (rate limiting) e registro de auditoria.
 *              Não revela se o e-mail existe para maior segurança.
 * @param {RequestPasswordResetState} prevState - O estado anterior do formulário.
 * @param {FormData} formData - Os dados do formulário (deve conter 'email').
 * @returns {Promise<RequestPasswordResetState>} O novo estado do formulário com possíveis erros.
 */
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
    return { error: "Por favor, digite um e-mail válido." };
  }

  const validatedEmail = validation.data;
  const adminSupabase = createAdminClient();

  // A forma correta de buscar um usuário por e-mail é consultando a tabela auth.users.
  const { data: user, error: userError } = await adminSupabase
    .from("users")
    .select("id")
    .eq("email", validatedEmail)
    .single();

  if (userError && userError.code !== "PGRST116") {
    // PGRST116 = 'Not Found', o que não é um erro neste fluxo.
    logger.error(
      `[PasswordActions] Erro ao buscar usuário por e-mail ${validatedEmail}:`,
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
        `[PasswordActions] Erro ao gerar link de recuperação para ${validatedEmail}:`,
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
      `[PasswordActions] Solicitação de redefinição para e-mail não existente (oculto ao cliente): ${validatedEmail}`
    );
  }

  redirect("/auth-notice?message=check-email-for-reset");
}

/**
 * @async
 * @function updatePasswordAction
 * @description Atualiza a senha do usuário.
 * @param {UpdatePasswordFormState} prevState - O estado anterior do formulário.
 * @param {FormData} formData - Os dados do formulário.
 * @returns {Promise<UpdatePasswordFormState>} O novo estado do formulário.
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
      "Dados inválidos.";
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
        "Sessão de recuperação inválida ou expirada. Por favor, solicite um novo link.",
      success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    logger.error(
      `[PasswordActions] Erro ao atualizar a senha para ${user.id}:`,
      error.message
    );
    if (error.message.includes("token has expired")) {
      return {
        error: "O link de redefinição expirou. Por favor, solicite um novo.",
        success: false,
      };
    }
    return {
      error: "Não foi possível atualizar a senha. Tente novamente.",
      success: false,
    };
  }

  await createAuditLog("password_reset_success", { userId: user.id });
  await supabase.auth.signOut({ scope: "others" });

  return { error: null, success: true };
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Prevenção de Reutilização de Senha: Para segurança de nível empresarial, a `updatePasswordAction` poderia consultar um hash das N senhas anteriores do usuário (se armazenadas de forma segura) para prevenir a reutilização de senhas recentes.
 * 2. Integração com `zxcvbn`: Em vez de uma lógica de pontuação simples, pode-se integrar uma biblioteca como `zxcvbn-ts` para uma análise de força de senha muito mais robusta e precisa, que detecta padrões comuns e palavras de dicionário.
 * 3. Internacionalização de Mensagens de Erro Zod: Integrar `zod-i18n` para que as mensagens de erro do schema de validação (e.g., "As senhas não coincidem") sejam traduzidas automaticamente com base no idioma do usuário.
 * 4. Forçar Encerramento de Sessão em Outros Dispositivos: Após uma atualização de senha bem-sucedida, a função `supabase.auth.signOut({ scope: 'others' })` é invocada para invalidar todas as outras sessões ativas do usuário, uma prática de segurança recomendada. (Já implementado).
 */
