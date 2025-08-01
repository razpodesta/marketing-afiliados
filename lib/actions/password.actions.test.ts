// lib/actions/password.actions.test.ts
/**
 * @file password.actions.test.ts
 * @description Arnés de pruebas canónico para las Server Actions de contraseña.
 *              Valida la seguridad, resiliencia y flujos lógicos de `requestPasswordResetAction`
 *              y `updatePasswordAction`. Actualizado para reflejar la corrección de tipos.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.1.0 (Type-Safety Correction)
 */
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminClient, createClient } from "@/lib/supabase/server";

import { createAuditLog, EmailService, rateLimiter } from "./_helpers";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "./password.actions";

// --- Simulación de Dependencias ---
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ headers: () => new Map() }));
vi.mock("@/lib/supabase/server");
vi.mock("./_helpers");

describe("Arnés de Pruebas: lib/actions/password.actions.ts", () => {
  const mockUser = { id: "user-test-id-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Acción: requestPasswordResetAction", () => {
    it("Seguridad: debe fallar si se excede el límite de tasa (rate limit)", async () => {
      // Arrange
      const errorMessage = "Demasiadas solicitudes.";
      vi.mocked(rateLimiter.check).mockResolvedValue({
        success: false,
        error: errorMessage,
      });
      const formData = new FormData();
      formData.append("email", mockUser.email);

      // Act
      const result = await requestPasswordResetAction(
        { error: null },
        formData
      );

      // Assert
      expect(result.error).toBe(errorMessage);
      expect(EmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("Seguridad: debe redirigir sin enviar email si el usuario no existe", async () => {
      // Arrange
      vi.mocked(rateLimiter.check).mockResolvedValue({ success: true });
      const mockAdminClient = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        auth: { admin: { generateLink: vi.fn() } },
      };
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any);

      const formData = new FormData();
      formData.append("email", "notfound@example.com");

      // Act
      await requestPasswordResetAction({ error: null }, formData);

      // Assert
      expect(EmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalledWith(
        "password_reset_request",
        expect.any(Object)
      );
      expect(redirect).toHaveBeenCalledWith(
        "/auth-notice?message=check-email-for-reset"
      );
    });
  });

  describe("Acción: updatePasswordAction", () => {
    it("Validación: debe fallar si las contraseñas no coinciden", async () => {
      // Arrange
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword456");

      // Act
      const result = await updatePasswordAction(
        { error: null, success: false },
        formData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Las contraseñas no coinciden.");
    });

    it("Seguridad: debe fallar si no hay una sesión de recuperación activa", async () => {
      // Arrange
      vi.mocked(createClient).mockReturnValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      } as any);
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      // Act
      const result = await updatePasswordAction(
        { error: null, success: false },
        formData
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain(
        "Sesión de recuperación inválida o expirada"
      );
    });

    it("Camino Feliz: debe actualizar la contraseña y cerrar otras sesiones", async () => {
      // Arrange
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
          updateUser: vi.fn().mockResolvedValue({ error: null }),
          signOut: vi.fn().mockResolvedValue({ error: null }),
        },
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as any);
      const formData = new FormData();
      formData.append("password", "newValidPassword123!");
      formData.append("confirmPassword", "newValidPassword123!");

      // Act
      const result = await updatePasswordAction(
        { error: null, success: false },
        formData
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newValidPassword123!",
      });
      expect(createAuditLog).toHaveBeenCalledWith("password_reset_success", {
        userId: mockUser.id,
      });
      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({
        scope: "others",
      });
    });
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas de seguridad.
 *
 * 1.  **Factoría de Mocks Compartida**: Mover la creación de mocks (ej. mockUser, mockSupabase) a un archivo de utilidades de prueba (`lib/test/utils.ts`) para reutilizarlo en otras suites de pruebas de acciones, adhiriéndose al principio DRY.
 * 2.  **Pruebas de Contenido de Email**: Extender el mock de `EmailService` para que capture los argumentos con los que es llamado. Añadir una prueba que verifique que el `resetLink` enviado en el email es el correcto.
 * 3.  **Pruebas de Errores de Base de Datos**: Añadir pruebas que simulen diferentes códigos de error devueltos por Supabase y verifiquen que la acción los maneja de forma robusta, devolviendo mensajes de error apropiados al cliente.
 */
// lib/actions/password.actions.test.ts
