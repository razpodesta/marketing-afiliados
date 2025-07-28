// Ruta: app/actions/_helpers/email.helper.ts
/**
 * @file email.helper.ts
 * @description Simulación de un servicio de Email Transaccional (ej. Resend, Postmark).
 *
 * @author Metashark
 * @version 1.0.0
 */
"use server";
import { logger } from "@/lib/logging";

export const EmailService = {
  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<{ success: boolean }> {
    logger.info(
      `[EmailService] Enviando email de reseteo a ${email} con el enlace: ${resetLink}`
    );
    return { success: true };
  },
};
