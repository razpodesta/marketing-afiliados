// lib/actions/auth.actions.ts
/**
 * @file lib/actions/auth.actions.ts
 * @description Contém as Server Actions relacionadas à autenticação e à sessão do usuário.
 *              Inclui proteção contra abuso, integração com serviço de e-mail transacional
 *              e logging de auditoria para ações críticas.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 4.3.0 (Fix for getUserByEmail and Modularized Helpers)
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { EmailSchema, type RequestPasswordResetState } from "@/lib/validators";

import { createAuditLog, EmailService, rateLimiter } from "./_helpers"; // Importa helpers de _helpers/index.ts

// --- Esquemas de Validação ---
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

// --- Server Actions ---

/**
 * @async
 * @function signOutAction
 * @description Encerra a sessão do usuário atual, registra o evento de auditoria
 *              e redireciona para a página inicial.
 * @returns {Promise<void>}
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await createAuditLog("user_sign_out", { userId: session.user.id });
  }
  await supabase.auth.signOut();
  return redirect("/");
}

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

  // CORREÇÃO: `adminSupabase.auth.admin.getUserByEmail` não existe.
  // A forma correta para verificar a existência de um usuário por e-mail com privilégios de serviço
  // é consultando diretamente a tabela `auth.users` via o cliente de admin.
  const { data: userRecord, error: userRecordError } = await adminSupabase
    .from("users") // A tabela 'users' está no esquema 'auth' do Supabase
    .select("id")
    .eq("email", validatedEmail)
    .single();

  if (userRecordError && userRecordError.code !== "PGRST116") {
    // PGRST116 = 'Not Found', o que não é um erro neste fluxo (não queremos revelar a existência do e-mail).
    logger.error(
      `[AuthActions] Erro ao buscar usuário por e-mail ${validatedEmail} para auditoria:`,
      userRecordError
    );
  }

  await createAuditLog("password_reset_request", {
    targetEmail: validatedEmail,
    userId: userRecord?.id, // Usa o ID do usuário se encontrado
  });

  // Só tentamos gerar o link se o usuário realmente existe no Auth do Supabase
  if (userRecord) {
    // Verifica se o usuário foi encontrado
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: "recovery",
      email: validatedEmail,
    });

    if (error || !data) {
      logger.error(
        `[AuthActions] Erro ao gerar link de recuperação para ${validatedEmail}:`,
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
      `[AuthActions] Solicitação de redefinição para e-mail não existente (oculto ao cliente): ${validatedEmail}`
    );
  }

  // Sempre redirecionar para a página de aviso, independentemente se o e-mail existe ou não
  redirect("/auth-notice?message=check-email-for-reset");
}

/**
 * @async
 * @function updatePasswordAction
 * @description Atualiza a senha do usuário atual após um processo de recuperação.
 *              Verifica a sessão de recuperação e invalida outras sessões.
 * @param {UpdatePasswordFormState} prevState - O estado anterior do formulário.
 * @param {FormData} formData - Os dados do formulário (deve conter 'password' e 'confirmPassword').
 * @returns {Promise<UpdatePasswordFormState>} O novo estado do formulário com possíveis erros ou sucesso.
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
      `[AuthActions] Erro ao atualizar a senha para ${user.id}:`,
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

  // Opcional: invalidar todas as demais sessões do usuário por segurança.
  await supabase.auth.signOut({ scope: "others" });

  return { error: null, success: true };
}

/* Melhorias Futuras Detectadas (Existentes Revalidadas e Novas Incrementadas)
 * 1. Implementação Real de Serviços Externos: Substituir as simulações de `rateLimiter` e `EmailService` por clientes reais (e.g., Upstash Redis, Resend), configurando variáveis de ambiente e tratando suas respostas de API.
 * 2. Visualizador de Logs de Auditoria: Construir uma interface no `dev-console` ou em um dashboard de administração que permita aos administradores buscar, filtrar e visualizar os registros da tabela `audit_logs`.
 * 3. Prevenção de Reutilização de Senha: Para segurança de nível empresarial, `updatePasswordAction` poderia consultar um hash das N senhas anteriores do usuário (se armazenadas de forma segura) para prevenir a reutilização de senhas recentes.
 * 4. Tipagem de Email e Password Reset Emails: Para os e-mails transacionais, usar um componente React dedicado (e.g., `PasswordResetEmail`) e tipá-lo para que o `EmailService` envie HTML renderizado, não apenas links. (Já previsto no boilerplate comentado do EmailService).
 */
