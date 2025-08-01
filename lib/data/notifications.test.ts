// lib/data/notifications.test.ts
/**
 * @file notifications.test.ts
 * @description Arnés de pruebas de producción para el aparato de datos de Notificaciones.
 *              Valida la correcta construcción de consultas, el manejo de datos
 *              y la resiliencia ante errores de la capa de acceso a datos.
 * @author L.I.A. Legacy
 * @version 1.0.0 (Initial Test Harness)
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Factoría de Mocks**: (Vigente) Crear una función `createMockNotification(overrides)` para generar datos de prueba de forma más limpia y consistente, reduciendo la duplicación en las pruebas.
 * 2.  **Validación de Contrato de Tipos**: (Vigente) Añadir una prueba que valide que la forma de los datos devueltos por el mock de Supabase se alinea perfectamente con el tipo `Notification`, garantizando la integridad del contrato.
 * 3.  **Pruebas de Paginación**: (Nueva) Una vez que se implemente la paginación en la capa de datos, añadir pruebas que verifiquen que los parámetros `range()` se calculan y aplican correctamente a la consulta.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationsByUserId } from "./notifications";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logging", () => ({ logger: { error: vi.fn() } }));

describe("Arnés de Pruebas: lib/data/notifications.ts", () => {
  let mockQueryBuilder: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock detallado del query builder de Supabase
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }), // La promesa se resuelve al final
    };
    const mockSupabase = { from: vi.fn(() => mockQueryBuilder) };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  it("Camino Feliz: debe construir la consulta correcta y devolver los datos", async () => {
    // Arrange
    const mockData = [{ id: 1, type: "test", user_id: "user-123" }];
    mockQueryBuilder.order.mockResolvedValue({ data: mockData, error: null });
    const userId = "user-123";

    // Act
    const result = await getUnreadNotificationsByUserId(userId);

    // Assert
    expect(result).toEqual(mockData);
    expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", userId);
    expect(mockQueryBuilder.is).toHaveBeenCalledWith("read_at", null);
    expect(mockQueryBuilder.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("Estado Vacío: debe devolver un array vacío si no hay notificaciones", async () => {
    // Arrange
    mockQueryBuilder.order.mockResolvedValue({ data: [], error: null });

    // Act
    const result = await getUnreadNotificationsByUserId("user-456");

    // Assert
    expect(result).toEqual([]);
  });

  it("Manejo de Errores: debe lanzar un error si la consulta a la base de datos falla", async () => {
    // Arrange
    const dbError = new Error("Connection Failure");
    mockQueryBuilder.order.mockResolvedValue({ data: null, error: dbError });

    // Act & Assert
    await expect(getUnreadNotificationsByUserId("user-789")).rejects.toThrow(
      "No se pudieron obtener las notificaciones."
    );
  });
});
// lib/data/notifications.test.ts
