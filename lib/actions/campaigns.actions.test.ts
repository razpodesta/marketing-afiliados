// Ruta: lib/actions/campaigns.actions.test.ts
/**
 * @file campaigns.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Campañas.
 *              Valida el ciclo de vida completo (crear, eliminar), incluyendo lógica de
 *              negocio, manejo de permisos y resiliencia ante errores.
 * @author Validator
 * @version 2.1.0 (High-Fidelity Mocking & Type Safety)
 */
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import {
  createCampaignAction,
  deleteCampaignAction,
} from "./campaigns.actions";

// --- Simulación de Dependencias ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("@/lib/data/sites");
vi.mock("next/cache");
vi.mock("@/lib/logging", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe("Arnés de Pruebas: lib/actions/campaigns.actions.ts", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockSite = { id: "site-456", workspace_id: "ws-123" };
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Se reconstruye el mock del cliente de Supabase antes de cada prueba.
    // Esta es la corrección fundamental: cada método retorna `this` (`mockReturnThis`)
    // para permitir el encadenamiento, y el método final (`.single()`, etc.)
    // devuelve una promesa resuelta con la estructura de datos correcta.
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  // --- Suite para createCampaignAction ---
  describe("Acción: createCampaignAction", () => {
    const formData = new FormData();
    formData.append("name", "Campaña de Lanzamiento");
    formData.append("siteId", "site-456");

    beforeEach(() => {
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe crear una campaña y generar un slug automáticamente", async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: "new-campaign-id" },
        error: null,
      });

      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Campaña de Lanzamiento",
          slug: "campana-de-lanzamiento", // Slug generado por el esquema Zod
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(
        "/dashboard/sites/site-456/campaigns"
      );
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos en el workspace", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toContain("No tienes permiso para crear campañas");
    });

    it("Manejo de Errores: debe fallar si el sitio asociado no existe", async () => {
      // Arrange
      vi.mocked(sitesData.getSiteById).mockResolvedValue(null);

      // Act
      const result = await createCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("El sitio asociado no existe.");
    });
  });

  // --- Suite para deleteCampaignAction ---
  describe("Acción: deleteCampaignAction", () => {
    const mockCampaign = {
      id: "campaign-789",
      site_id: "site-456",
      sites: { workspace_id: "ws-123" },
    };
    const formData = new FormData();
    formData.append("campaignId", "campaign-789");

    beforeEach(() => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockCampaign,
        error: null,
      });
      // La llamada a delete() también debe ser encadenable y la promesa se resuelve al final
      mockSupabaseClient.eq.mockResolvedValue({ error: null });
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe eliminar una campaña exitosamente", async () => {
      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalled();
    });

    it("Seguridad: debe fallar si el usuario no está autenticado", async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Usuario no autenticado.");
    });

    it("Manejo de Errores: debe fallar si la campaña no se encuentra", async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" }, // Simulación más realista
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("La campaña no se pudo encontrar.");
    });

    it("Manejo de Errores: debe fallar si hay una inconsistencia de datos (sin workspace)", async () => {
      // Arrange
      const campaignWithoutWorkspace = { ...mockCampaign, sites: null };
      mockSupabaseClient.single.mockResolvedValue({
        data: campaignWithoutWorkspace,
        error: null,
      });

      // Act
      const result = await deleteCampaignAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("Error de integridad de datos.");
    });
  });
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas de acciones.
 *
 * 1.  **Factoría de Mocks Compartida:** Mover la lógica de creación de mocks (como `mockUser` o la inicialización del `mockSupabaseClient`) a un archivo de utilidad de pruebas compartido (`lib/test/utils.ts`) para reutilizarla en otras suites de pruebas de acciones.
 * 2.  **Pruebas de Concurrencia:** Diseñar pruebas que simulen acciones rápidas y concurrentes (ej. eliminar una campaña justo después de crearla) para verificar la robustez del manejo de estado y la invalidación de caché.
 * 3.  **Validación de Contratos con Zod en Pruebas:** Importar los esquemas de Zod de las acciones y usarlos para validar la forma de los `FormData` de prueba y los objetos de resultado, asegurando que las pruebas se mantengan alineadas con los contratos de datos.
 */

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El arnés de pruebas `campaigns.actions.test.ts` es una red de seguridad de
 *               fiabilidad para la lógica de negocio de las campañas.
 *
 * @functionality
 * - **Aislamiento a través de Simulación de Alta Fidelidad:** Utiliza `vi.mock` para
 *   reemplazar dependencias externas clave. La corrección crítica fue reconstruir el
 *   `mockSupabaseClient` antes de cada prueba, asegurando que la simulación del
 *   encadenamiento de métodos (`.from().select()...`) sea precisa y esté correctamente
 *   tipada, eliminando así todos los errores de compilación.
 * - **Validación de Caminos Felices:** Verifica que las acciones se completen exitosamente
 *   bajo condiciones ideales, llamando a las dependencias correctas (como `revalidatePath`)
 *   y transformando los datos como se espera (ej. generación de slug).
 * - **Validación de Guardianes de Seguridad:** Simula escenarios donde los permisos son
 *   denegados (`hasWorkspacePermission` devuelve `false`) y afirma que la acción falla
 *   con el mensaje de error de seguridad apropiado.
 * - **Pruebas de Resiliencia:** Valida que las acciones manejen de forma grácil los
 *   errores de la base de datos o las inconsistencias de datos, devolviendo un
 *   resultado de fallo predecible.
 *
 * @relationships
 * - Valida el aparato `lib/actions/campaigns.actions.ts`.
 * - Sus resultados impactan directamente en la fiabilidad de la UI de gestión de campañas
 *   (ej. `CampaignsClient.tsx`), que depende de estas acciones.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en la lógica de negocio,
 *   permisos o manejo de errores de las acciones de campañas. Actúa como un guardián
 *   automatizado que protege la integridad de una de las entidades de datos más
 *   importantes del sistema.
 * =================================================================================================
 */
