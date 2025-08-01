// lib/data/sites.test.ts
/**
 * @file sites.test.ts
 * @description Arnés de pruebas para el aparato de datos de Sitios. Valida
 *              la nueva lógica de búsqueda en el servidor.
 * @author L.I.A. Legacy
 * @version 1.0.0 (Initial Test Harness)
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClient } from "@/lib/supabase/server";
import { getSitesByWorkspaceId } from "./sites";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/logging", () => ({ logger: { error: vi.fn() } }));

describe("Arnés de Pruebas: lib/data/sites.ts", () => {
  let mockQueryBuilder: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };
    const mockSupabase = { from: vi.fn(() => mockQueryBuilder) };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  it("Camino Feliz (Sin Búsqueda): debe construir la consulta sin el filtro `ilike`", async () => {
    await getSitesByWorkspaceId("ws-123", {});
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("workspace_id", "ws-123");
    expect(mockQueryBuilder.ilike).not.toHaveBeenCalled();
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 8); // 9 per page default
  });

  it("Camino Feliz (Con Búsqueda): debe añadir el filtro `ilike` a la consulta", async () => {
    const searchQuery = "test-site";
    await getSitesByWorkspaceId("ws-123", { query: searchQuery });
    expect(mockQueryBuilder.ilike).toHaveBeenCalledWith(
      "subdomain",
      `%${searchQuery}%`
    );
  });

  it("Manejo de Errores: debe lanzar un error si la consulta a la base de datos falla", async () => {
    const dbError = new Error("DB Connection Failed");
    mockQueryBuilder.range.mockResolvedValue({ data: null, error: dbError });
    await expect(getSitesByWorkspaceId("ws-123", {})).rejects.toThrow(
      "No se pudieron obtener los sitios del workspace."
    );
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Validación de `totalCount`**: Añadir una aserción que verifique que la función devuelve correctamente el `totalCount` proporcionado por el mock de Supabase.
 * 2.  **Pruebas de Paginación**: Añadir pruebas que pasen diferentes valores de `page` y verifiquen que el método `.range()` es llamado con los argumentos `from` y `to` correctos.
 * 3.  **Pruebas de Ordenamiento**: Una vez que se implemente el ordenamiento dinámico, añadir pruebas que verifiquen que `.order()` es llamado con la columna y dirección correctas.
 */
// lib/data/sites.test.ts
