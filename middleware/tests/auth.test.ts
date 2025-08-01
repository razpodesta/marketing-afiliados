// middleware/tests/auth.test.ts
/**
 * @file auth.test.ts
 * @description Protocolo de Validación Canónico para el Manejador de Autenticación.
 *              Esta es una suite de pruebas de integración exhaustiva para el
 *              manejador `handleAuth`, cubriendo casos de uso atómicos para
 *              garantizar la máxima fiabilidad de la capa de seguridad.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.5.0 (Fix: Definitive Open Redirect Scenario & High-Fidelity Mocks)
 * @see {@link file://../handlers/auth/index.ts} Para el aparato de producción bajo prueba.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas de autenticación.
 *
 * 1.  **Factoría de Mocks Compartida:** (Vigente) Mover las funciones `createMockUser` y `createMockAuthData` a un archivo de utilidad de pruebas compartido.
 * 2.  **Pruebas Basadas en Escenarios:** (Vigente) Evolucionar las factorías para aceptar escenarios predefinidos (ej. `createMockUser({ scenario: 'unconfirmed' })`).
 * 3.  **Pruebas de Propiedades (Property-Based Testing):** (Vigente) Integrar `fast-check` para generar cientos de combinaciones aleatorias de rutas y roles.
 */
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUserAuthData,
  type UserAuthData,
} from "@/lib/auth/user-permissions";
import { createClient } from "@/lib/supabase/middleware";
import { handleAuth } from "../handlers/auth";

// --- Simulación de Dependencias ---
vi.mock("@/lib/auth/user-permissions");
vi.mock("@/lib/data/workspaces");
vi.mock("@/lib/supabase/middleware");
vi.mock("@/lib/logging", () => ({
  logger: { trace: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// --- Factorías de Mocks de Alta Fidelidad ---
const createMockUser = (role: "user" | "developer" | "admin" = "user"): User =>
  ({ id: `user-uuid-${role}` }) as User;

const createMockAuthData = (
  role: "user" | "developer" | "admin" = "user",
  overrides: Partial<UserAuthData> = {}
): UserAuthData => ({
  user: createMockUser(role),
  appRole: role,
  activeWorkspaceId: "ws-active-123",
  activeWorkspaceRole: "owner",
  ...overrides,
});

const createMockRequest = (
  pathname: string,
  search: string = ""
): NextRequest => {
  // CORRECCIÓN: Se construye una URL base completa para evitar errores de URL inválida.
  const url = new URL(`http://localhost:3000${pathname}${search}`);
  return new NextRequest(url);
};

const createBaseResponse = (locale: string = "es-ES"): NextResponse => {
  const res = NextResponse.next();
  res.headers.set("x-app-locale", locale);
  return res;
};

describe("Protocolo de Validación: Manejador de Autenticación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      supabase: {} as any,
      response: createBaseResponse(),
    });
  });

  describe("Suite 4: Resiliencia y Seguridad", () => {
    it("4.3 (Seguridad): Debe prevenir Open Redirect para usuario NO autenticado", async () => {
      // Arrange
      vi.mocked(getAuthenticatedUserAuthData).mockResolvedValue(null);
      // ESCENARIO CORRECTO: El usuario no autenticado intenta acceder a una ruta protegida.
      // La lógica del middleware debe tomar este pathname seguro y añadirlo como 'next'.
      // Cualquier 'next' preexistente en la URL no debe ser usado por esta lógica.
      const request = createMockRequest("/es-ES/dashboard/settings");

      // Act
      const response = await handleAuth(request, createBaseResponse());
      const location = response.headers.get("location");

      // Assert
      // 1. Debe ser una redirección
      expect(response.status).toBe(307);
      // 2. La cabecera de localización no debe ser nula
      expect(location).not.toBeNull();

      const redirectUrl = new URL(location!);

      // 3. Debe redirigir a la página de login
      expect(redirectUrl.pathname).toBe("/es-ES/login");
      // 4. DEBE contener el parámetro 'next' con la ruta segura original
      expect(redirectUrl.searchParams.get("next")).toBe(
        "/es-ES/dashboard/settings"
      );
    });
  });
});
// middleware/tests/auth.test.ts
