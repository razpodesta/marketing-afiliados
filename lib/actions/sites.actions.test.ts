// Ruta: lib/actions/sites.actions.test.ts
/**
 * @file sites.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Sitios.
 *              Valida el ciclo de vida completo (crear, actualizar, eliminar), incluyendo
 *              lógica de negocio, manejo de permisos y resiliencia ante errores.
 *              Las simulaciones del cliente de Supabase han sido refinadas para un comportamiento
 *              más preciso en el "Camino Feliz" de creación.
 * @author Validator (Refactorizado por L.I.A Legacy)
 * @version 2.2.0 (Create Action Happy Path Fix)
 */
import { revalidatePath } from "next/cache";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { hasWorkspacePermission } from "@/lib/data/permissions";
import { sites as sitesData } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "./_helpers";
import {
  createSiteAction,
  updateSiteAction,
  deleteSiteAction,
} from "./sites.actions";

// --- Simulación de Dependencias (Mocks) ---
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data/permissions");
vi.mock("@/lib/data/sites");
vi.mock("./_helpers");
vi.mock("next/cache");
vi.mock("@/lib/logging", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe("Arnés de Pruebas: lib/actions/sites.actions.ts", () => {
  // CORRECCIÓN: Usar UUIDs válidos para los mocks.
  const MOCK_USER_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const MOCK_WORKSPACE_ID = "123e4567-e89b-12d3-a456-426614174000";
  const MOCK_SITE_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";

  const mockUser = { id: MOCK_USER_ID, email: "test@example.com" };

  // --- Suite para createSiteAction ---
  describe("Acción: createSiteAction", () => {
    let mockSupabaseClient: any;
    const formData = new FormData();
    formData.append("name", "Mi Sitio Válido");
    formData.append("subdomain", "sitio-valido");
    // 'icon' ya no se envía desde el formulario, ni se requiere en el esquema.
    // formData.append("icon", "🚀"); // ELIMINADO
    formData.append("workspaceId", MOCK_WORKSPACE_ID);

    beforeEach(() => {
      vi.clearAllMocks();
      // Re-crear el mock de supabase para cada prueba para evitar interferencias
      mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(), // Este será el punto de resolución para `insert().select().single()`
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
      vi.mocked(sitesData.getSiteDataByHost).mockResolvedValue(null);
    });

    it("Camino Feliz: debe crear un sitio exitosamente con datos válidos", async () => {
      // Arrange: Asegurar que el mock de `single()` devuelva éxito para la inserción
      mockSupabaseClient
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: { id: MOCK_SITE_ID },
          error: null,
        });

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("sites");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Mi Sitio Válido",
          subdomain: "sitio-valido",
          workspace_id: MOCK_WORKSPACE_ID,
          owner_id: MOCK_USER_ID,
          icon: null, // Si el formulario no lo envía, Supabase lo insertará como NULL por defecto
          description: null, // Si el formulario no lo envía, o lo envía vacío, será null
        })
      );
      expect(createAuditLog).toHaveBeenCalledWith(
        "site.created",
        expect.objectContaining({
          userId: MOCK_USER_ID,
          targetEntityId: MOCK_SITE_ID,
          targetEntityType: "site",
          metadata: {
            subdomain: "sitio-valido",
            name: "Mi Sitio Válido",
            workspaceId: MOCK_WORKSPACE_ID,
          },
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/sites");
    });

    it("Seguridad: debe fallar si el usuario no está autenticado", async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Usuario no autenticado.");
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("No tienes permiso");
    });
  });

  // --- Suite para updateSiteAction ---
  describe("Acción: updateSiteAction", () => {
    const mockSite = { id: MOCK_SITE_ID, workspace_id: MOCK_WORKSPACE_ID };
    const formData = new FormData();
    formData.append("siteId", MOCK_SITE_ID);
    formData.append("name", "Nombre Actualizado");

    beforeEach(() => {
      vi.clearAllMocks();
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe actualizar un sitio exitosamente", async () => {
      // Act
      const result = await updateSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalledWith(
        "site.updated",
        expect.any(Object)
      );
    });

    it("Manejo de Errores: debe fallar si el siteId no existe", async () => {
      // Arrange
      vi.mocked(sitesData.getSiteById).mockResolvedValue(null);

      // Act
      const result = await updateSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toBe("El sitio no fue encontrado.");
    });
  });

  // --- Suite para deleteSiteAction ---
  describe("Acción: deleteSiteAction", () => {
    const mockSite = {
      id: MOCK_SITE_ID,
      workspace_id: MOCK_WORKSPACE_ID,
      subdomain: "a-borrar",
    };
    const formData = new FormData();
    formData.append("siteId", MOCK_SITE_ID);

    beforeEach(() => {
      vi.clearAllMocks();
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);
      vi.mocked(sitesData.getSiteById).mockResolvedValue(mockSite as any);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
    });

    it("Camino Feliz: debe eliminar un sitio exitosamente", async () => {
      // Act
      const result = await deleteSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalledWith(
        "site.deleted",
        expect.any(Object)
      );
    });

    it("Seguridad: debe fallar si el usuario no tiene permisos para eliminar", async () => {
      // Arrange
      vi.mocked(hasWorkspacePermission).mockResolvedValue(false);

      // Act
      const result = await deleteSiteAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error).toContain(
          "No tienes permiso para eliminar este sitio."
        );
    });
  });
});

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Factoría de Mocks Compartida:** Mover las funciones y patrones de simulación (como el `mockSupabaseClient`) a un archivo de utilidad de pruebas compartido (`lib/test/utils.ts`) para reutilizarlos en todas las suites de pruebas de acciones, adhiriéndose al principio DRY.
 * 2.  **Pruebas de Límites de Planes:** Una vez que el sistema de facturación esté implementado, añadir pruebas que verifiquen que `createSiteAction` falla si el usuario intenta crear más sitios de los permitidos por su plan de suscripción.
 * 3.  **Validación de `FormData` con Zod:** Importar los esquemas de Zod de las acciones y usarlos para validar los `FormData` de prueba y los objetos de resultado, asegurando que las pruebas se mantengan alineadas con los contratos de datos de la aplicación.
 * 4.  **Prueba de 'icon' null:** Asegurar que `createSiteAction` recibe y persiste correctamente el valor `null` para el campo `icon` si no se envía desde el formulario. (Ya cubierto implícitamente por el cambio del test 'Camino Feliz').
 */
