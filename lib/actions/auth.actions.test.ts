// lib/actions/auth.actions.test.ts
/**
 * @file auth.actions.test.ts
 * @description Arnés de pruebas para las Server Actions de sesión (`auth.actions.ts`).
 *              Valida que el cierre de sesión se ejecute de forma segura, se audite
 *              correctamente y maneje los casos de borde.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Initial Test Harness)
 */
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";

import { createAuditLog } from "./_helpers";
import { signOutAction } from "./auth.actions";

// --- Simulación de Dependencias ---
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));
vi.mock("@/lib/supabase/server");
vi.mock("./_helpers");

describe("Arnés de Pruebas: lib/actions/auth.actions.ts", () => {
  const mockUser = { id: "user-test-id-123", email: "test@example.com" };
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = {
      auth: {
        getSession: vi.fn(),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  it("Camino Feliz: debe cerrar sesión, registrar en auditoría y redirigir al home", async () => {
    // Arrange
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    // Act
    await signOutAction();

    // Assert
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    expect(createAuditLog).toHaveBeenCalledWith("user_sign_out", {
      userId: mockUser.id,
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("Caso de Borde: debe redirigir al home incluso si no hay una sesión activa", async () => {
    // Arrange
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Act
    await signOutAction();

    // Assert
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    expect(createAuditLog).not.toHaveBeenCalled(); // No debe registrar si no hay usuario
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("Resiliencia: debe redirigir incluso si signOut falla", async () => {
    // Arrange
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: new Error("Network error"),
    });

    // Act
    await signOutAction();

    // Assert
    // La acción continúa y redirige, priorizando la experiencia del usuario.
    expect(redirect).toHaveBeenCalledWith("/");
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Cierre de Sesión Global**: Una vez implementada la mejora de "Global Sign-Out", añadir un test que verifique que `signOut` es llamado con el parámetro `{ scope: 'global' }`.
 * 2.  **Prueba de Redirección de Destino**: Si se implementa la redirección a una página `/logged-out`, actualizar el test para verificar que `redirect` es llamado con la nueva URL.
 * 3.  **Mock de Errores de Auditoría**: Añadir un test que simule un fallo en `createAuditLog` y verifique que la acción de `signOut` y la redirección se completan de todas formas, asegurando la resiliencia del flujo principal de cara al usuario.
 */
// lib/actions/auth.actions.test.ts
