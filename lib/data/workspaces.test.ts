// Ruta: lib/data/workspaces.test.ts
/**
 * @file workspaces.test.ts
 * @description Suite de pruebas de integración para el aparato de datos de Workspaces.
 *              Ha sido refactorizada con un andamiaje de simulación de alta fidelidad
 *              para garantizar la validación robusta de la lógica de negocio.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.0.0 (High-Fidelity Mocking & Full Validation)
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceForUser, getWorkspacesByUserId } from "./workspaces";

// --- Simulación de Dependencias de Alta Fidelidad ---

// Se simula el módulo completo para controlar la creación del cliente.
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logging", () => ({
  logger: { error: vi.fn() },
}));

// Se declara una variable para el mock que se reconfigurará en cada prueba.
let mockSupabaseClient: any;

beforeEach(() => {
  // Antes de cada prueba, se resetea el mock del cliente.
  mockSupabaseClient = {
    from: vi.fn(() => mockSupabaseClient),
    select: vi.fn(() => mockSupabaseClient),
    eq: vi.fn(() => mockSupabaseClient),
    limit: vi.fn(() => mockSupabaseClient),
    single: vi.fn(),
    // La promesa final de la cadena de consulta se mockea aquí
  };
  vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  vi.clearAllMocks();
});

// --- Suite de Pruebas Principal ---

describe("Capa de Datos: workspaces.ts", () => {
  describe("Función: getWorkspacesByUserId", () => {
    it("debe devolver una lista de workspaces transformados correctamente", async () => {
      // Arrange: Configurar el mock para devolver una estructura de datos anidada.
      const mockResponse = {
        data: [
          { workspaces: { id: "ws-1", name: "Workspace A" } },
          { workspaces: { id: "ws-2", name: "Workspace B" } },
        ],
        error: null,
      };
      mockSupabaseClient.eq.mockResolvedValue(mockResponse);

      // Act: Ejecutar la función bajo prueba.
      const result = await getWorkspacesByUserId("user-id");

      // Assert: Verificar que la transformación de datos fue exitosa.
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ws-1");
      expect(result[1].name).toBe("Workspace B");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("workspace_members");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("workspaces(*)");
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("user_id", "user-id");
    });

    it("debe devolver un array vacío si el usuario no pertenece a ningún workspace", async () => {
      // Arrange
      mockSupabaseClient.eq.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await getWorkspacesByUserId("user-with-no-memberships");

      // Assert
      expect(result).toEqual([]);
    });

    it("debe lanzar un error si la consulta a la base de datos falla", async () => {
      // Arrange
      const dbError = new Error("Connection failed");
      mockSupabaseClient.eq.mockResolvedValue({ data: null, error: dbError });

      // Act & Assert
      await expect(getWorkspacesByUserId("user-db-error")).rejects.toThrow(
        "No se pudieron cargar los datos de los workspaces."
      );
    });
  });

  describe("Función: getFirstWorkspaceForUser (Crítico para Onboarding)", () => {
    it("debe devolver el primer workspace si el usuario tiene uno", async () => {
      // Arrange
      const mockWorkspace = { id: "ws-123", name: "Mi Primer Workspace" };
      mockSupabaseClient.single.mockResolvedValue({
        data: { workspaces: mockWorkspace },
        error: null,
      });

      // Act
      const result = await getFirstWorkspaceForUser("user-with-workspaces");

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe("ws-123");
    });

    it("debe devolver null si el usuario no tiene workspaces (error PGRST116)", async () => {
      // Arrange: Simular el error "Not Found" que devuelve Supabase.
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      // Act
      const result = await getFirstWorkspaceForUser("new-user");

      // Assert
      expect(result).toBeNull();
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas de la capa de datos.
 *
 * 1.  **Factoría de Mocks Avanzada:** Crear funciones factoría (ej. `createMockWorkspaceResponse`) para generar datos de prueba complejos de forma más limpia y reutilizable, especialmente para probar la transformación de datos con estructuras más complejas.
 * 2.  **Validación de Contratos con Zod:** Importar el tipo `Workspace` y crear un `WorkspaceSchema` de Zod. Las pruebas podrían validar la forma de los datos devueltos contra este esquema, asegurando que el contrato de tipo se cumpla rigurosamente y no solo la presencia de algunas propiedades.
 * 3.  **Pruebas de Integración con Datos Reales (Opcional):** Para un nivel de confianza máximo, se podría configurar un pipeline de CI/CD que ejecute estas pruebas contra una base de datos de prueba temporal de Supabase, poblada con datos de prueba, para validar el comportamiento contra el sistema real, complementando las pruebas unitarias.
 */

/**
 * @fileoverview La suite de pruebas `workspaces.test.ts` ha sido blindada para garantizar la fiabilidad de la lógica de datos fundamental para el onboarding y la experiencia del dashboard.
 * @functionality
 * - **Simulación de Alta Fidelidad:** Utiliza un mock a nivel de módulo para `createClient` que replica con precisión la cadena de llamadas del constructor de consultas de Supabase. Esto resuelve la causa raíz de los fallos anteriores y permite una validación precisa.
 * - **Validación del Flujo de Onboarding:** Valida explícitamente el escenario más crítico para un nuevo usuario: que `getFirstWorkspaceForUser` devuelva `null` de forma segura cuando no se encuentran workspaces (error `PGRST116`).
 * - **Prueba de Transformación de Datos:** Asegura que la función `getWorkspacesByUserId` maneje correctamente la estructura de datos anidada devuelta por Supabase, previniendo errores de tipo en las capas superiores de la aplicación.
 * @relationships
 * - Valida el aparato `lib/data/workspaces.ts`.
 * - Sus resultados impactan directamente en la fiabilidad del `middleware` y del `DashboardLayout`.
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en la lógica de consulta o transformación de datos de los workspaces, actuando como una alerta temprana para problemas que afectarían a todos los nuevos usuarios.
 */
