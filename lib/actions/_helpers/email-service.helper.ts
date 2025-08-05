// lib/actions/_helpers/email-service.helper.ts
// No se necesita "use server" aquí si solo exporta un objeto de utilidades.

import { logger } from "@/lib/logging";

/**
 * @file lib/actions/_helpers/email-service.helper.ts
 * @description Helper para simular (e futuramente integrar) un servicio de envío de e-mails transacionales.
 *              Esto abstrae la lógica de envío de e-mails, como redefinición de contraseña o confirmación de cuenta.
 * @author L.I.A Legacy
 * @version 1.0.0 (Initial Creation)
 */

/**
 * @const EmailService
 * @description Objeto que encapsula métodos para el envío de e-mails.
 *              Actualmente es una simulación; en producción, integraría con servicios como Resend o Postmark.
 */
export const EmailService = {
  /**
   * @async
   * @function sendPasswordResetEmail
   * @description Simula el envío de un e-mail de redefinición de senha.
   * @param {string} email - El endereço de e-mail do destinatário.
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

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Futuras
 * 1. **Integración Real con Proveedor de Email**: ((Vigente)) Reemplazar la simulación actual con una integración real con un proveedor de email transaccional (ej. Resend, Postmark).
 * 2. **Plantillas de Email Dinámicas**: ((Vigente)) Usar librerías como `react-email` para construir las plantillas de email con React.
 */
// lib/actions/_helpers/email-service.helper.ts
