// lib/actions/_helpers/email-service.helper.ts
/**
 * @file lib/actions/_helpers/email-service.helper.ts
 * @description Helper para simular (e futuramente integrar) um serviço de envio de e-mails transacionais.
 *              Isso abstrai a lógica de envio de e-mails, como redefinição de senha ou confirmação de conta.
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Creation)
 */
"use server";

import { logger } from "@/lib/logging";

/**
 * @const EmailService
 * @description Objeto que encapsula métodos para o envio de e-mails.
 *              Atualmente é uma simulação; em produção, integraria com serviços como Resend ou Postmark.
 */
export const EmailService = {
  /**
   * @async
   * @function sendPasswordResetEmail
   * @description Simula o envio de um e-mail de redefinição de senha.
   * @param {string} email - O endereço de e-mail do destinatário.
   * @param {string} resetLink - O link de redefinição de senha.
   * @returns {Promise<{ success: boolean }>} O resultado da operação de envio.
   */
  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<{ success: boolean }> {
    logger.info(
      `[EmailService:Simulated] Enviando e-mail de redefinição para ${email} com o link: ${resetLink}`
    );
    // Lógica de exemplo com Resend (comentada para simulação):
    // await resend.emails.send({
    //   from: 'onboarding@metashark.co',
    //   to: email,
    //   subject: 'Redefina sua senha Metashark',
    //   react: PasswordResetEmail({ resetLink }), // Componente React para o e-mail
    // });
    return { success: true };
  },
};
