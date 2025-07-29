// Ruta: lib/data/workspaces.test.ts
/**
 * @file workspaces.test.ts
 * @description Suite de pruebas de integración para el aparato de datos de Workspaces.
 *              Esta suite valida la lógica de obtención de datos que es CRÍTICA para
 *              el flujo de onboarding de nuevos usuarios y la carga del contexto del dashboard.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 1.0.0 (Initial Onboarding Logic Suite)
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as SupabaseServer from "@/lib/supabase/server";

import { getFirstWorkspaceForUser, getWorkspacesByUserId } from "./workspaces";

// --- Simulación (Mocking) de Dependencias ---

vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logging", () => ({
  logger: {
    trace: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// --- Factoría de Mocks para Datos de Prueba ---

const mockWorkspacesResponse = (workspaces: any[] | null) => ({
  data: workspaces,
  error: null,
});

const mockDbClient = (
  response: { data: any; error: any },
  method: "select" | "single" = "select"
) => {
  const fromMock = vi.fn().mockImplementation(() => {
    if (method === "select") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(response),
      };
    }
    if (method === "single") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(response),
      };
    }
    return {};
  });

  vi.mocked(SupabaseServer.createClient).mockReturnValue({
    from: fromMock,
  } as any);
};

// --- Suite de Pruebas Principal ---

describe("Capa de Datos: workspaces.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Pruebas para getFirstWorkspaceForUser (Crítico para Onboarding) ---
  describe("Función: getFirstWorkspaceForUser", () => {
    it("debe devolver el primer workspace si el usuario tiene uno", async () => {
      const mockWorkspace = { id: "ws-123", name: "Mi Primer Workspace" };
      mockDbClient(
        { data: { workspaces: mockWorkspace }, error: null },
        "single"
      );

      const result = await getFirstWorkspaceForUser("user-with-workspaces");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("ws-123");
      expect(result?.name).toBe("Mi Primer Workspace");
    });

    it("debe devolver null si el usuario NO tiene workspaces (escenario de onboarding)", async () => {
      // Supabase devuelve un error 'PGRST116' cuando .single() no encuentra filas.
      const notFoundError = { code: "PGRST116", message: "Not Found" };
      mockDbClient({ data: null, error: notFoundError }, "single");

      const result = await getFirstWorkspaceForUser("new-user-no-workspaces");

      expect(result).toBeNull();
    });

    it("debe devolver null de forma segura si la consulta a la base de datos falla", async () => {
      const dbError = { code: "50000", message: "Internal Server Error" };
      mockDbClient({ data: null, error: dbError }, "single");

      const result = await getFirstWorkspaceForUser("user-db-error");

      expect(result).toBeNull();
    });

    it("debe devolver null si la respuesta de la base de datos es inesperadamente nula", async () => {
      mockDbClient({ data: null, error: null }, "single");

      const result = await getFirstWorkspaceForUser("user-unexpected-null");

      expect(result).toBeNull();
    });
  });

  // --- Pruebas para getWorkspacesByUserId (Crítico para el Layout del Dashboard) ---
  describe("Función: getWorkspacesByUserId", () => {
    it("debe devolver una lista de workspaces y transformar los datos anidados correctamente", async () => {
      const mockResponse = [
        { workspaces: { id: "ws-1", name: "Workspace A" } },
        { workspaces: { id: "ws-2", name: "Workspace B" } },
      ];
      mockDbClient(mockWorkspacesResponse(mockResponse));

      const result = await getWorkspacesByUserId("user-id");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ws-1");
      expect(result[1].name).toBe("Workspace B");
    });

    it("debe devolver un array vacío si el usuario no pertenece a ningún workspace", async () => {
      mockDbClient(mockWorkspacesResponse([]));

      const result = await getWorkspacesByUserId("user-with-no-memberships");

      expect(result).toEqual([]);
    });

    it("debe filtrar correctamente los workspaces nulos de la respuesta", async () => {
      const mockResponseWithNulls = [
        { workspaces: { id: "ws-1", name: "Workspace A" } },
        { workspaces: null }, // Simula un dato corrupto o inconsistente
        { workspaces: { id: "ws-3", name: "Workspace C" } },
      ];
      mockDbClient(mockWorkspacesResponse(mockResponseWithNulls));

      const result = await getWorkspacesByUserId("user-id-with-nulls");

      expect(result).toHaveLength(2);
      expect(result.find((ws) => ws === null)).toBeUndefined();
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Pruebas de Excepciones:** Añadir una prueba que verifique que `getWorkspacesByUserId` lanza un `Error` si la consulta a la base de datos falla, como se espera de su contrato.
 * 2.  **Factoría de Mocks Avanzada:** Crear funciones factoría (`createMockWorkspaceResponse`) para generar datos de prueba complejos de forma más limpia y reutilizable.
 * 3.  **Validación con Zod:** Importar el tipo `Workspace` y crear un `WorkspaceSchema` de Zod para validar la forma de los datos devueltos en las pruebas, asegurando que el contrato de tipo se cumpla rigurosamente.
 */

/**
 * @fileoverview La suite de pruebas `workspaces.test.ts` blinda la lógica de datos fundamental para el onboarding y la experiencia del dashboard.
 * @functionality
 * - **Aislamiento Total:** Utiliza `vi.mock` para simular el cliente de Supabase, aislando la lógica de transformación de datos de la conexión de red real.
 * - **Validación del Flujo de Onboarding:** Valida explícitamente el escenario más crítico para un nuevo usuario: que `getFirstWorkspaceForUser` devuelva `null` de forma segura cuando no se encuentran workspaces.
 * - **Prueba de Transformación de Datos:** Asegura que la función `getWorkspacesByUserId` maneje correctamente la estructura de datos anidada devuelta por Supabase, previniendo errores de tipo en la capa de la UI.
 * @relationships
 * - Valida el aparato `lib/data/workspaces.ts`.
 * - Sus resultados impactan directamente en la fiabilidad del `middleware` y del `DashboardLayout`.
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en la lógica de consulta o transformación de datos de los workspaces, actuando como una alerta temprana para problemas que afectarían a todos los nuevos usuarios.
 */
// Ruta: lib/data/workspaces.test.ts
