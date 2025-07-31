// Ruta: lib/actions/sites.actions.test.ts
/**
 * @file sites.actions.test.ts
 * @description Suite de pruebas de integración exhaustiva para las Server Actions de Sitios.
 *              Valida el ciclo de vida completo (crear, actualizar, eliminar), incluyendo
 *              lógica de negocio, manejo de permisos y resiliencia ante errores.
 * @author Validator
 * @version 2.1.0 (UUID-Compliant Mock Data)
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
    formData.append("icon", "🚀");
    formData.append("workspaceId", MOCK_WORKSPACE_ID);

    beforeEach(() => {
      vi.clearAllMocks();
      mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: () => ({
          insert: () => ({ select: () => ({ single: vi.fn() }) }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
      vi.mocked(hasWorkspacePermission).mockResolvedValue(true);
      vi.mocked(sitesData.getSiteDataByHost).mockResolvedValue(null);
    });

    it("Camino Feliz: debe crear un sitio exitosamente con datos válidos", async () => {
      // Arrange
      mockSupabaseClient
        .from()
        .insert()
        .select()
        .single.mockResolvedValue({ data: { id: MOCK_SITE_ID }, error: null });

      // Act
      const result = await createSiteAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(createAuditLog).toHaveBeenCalled();
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
        from: () => ({
          update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }),
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
        from: () => ({
          delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }),
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

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El arnés de pruebas `sites.actions.test.ts` valida el ciclo de vida completo
 *               de la entidad `site`, asegurando la robustez de la lógica de negocio y
 *               la seguridad de las operaciones.
 *
 * @functionality
 * - **Simulación de Alta Fidelidad y Contratos de Tipos:** La refactorización crítica
 *   ha sido la introducción de UUIDs válidos para los datos de prueba, alineando la
 *   suite de pruebas con los contratos de validación de Zod definidos en la aplicación.
 *   Esto resuelve la causa raíz de todos los fallos anteriores.
 * - **Cobertura de Ciclo de Vida (CRUD):** Las pruebas están estructuradas en sub-suites
 *   para cada acción (`create`, `update`, `delete`), validando sistemáticamente:
 *     1. El "camino feliz" donde la operación tiene éxito.
 *     2. Los guardianes de seguridad, asegurando que los usuarios no autenticados o sin
 *        permisos sean bloqueados correctamente.
 *     3. El manejo de errores, como intentar operar sobre una entidad que no existe.
 * - **Validación de Efectos Secundarios:** Las pruebas verifican que las acciones no solo
 *   devuelvan el resultado correcto, sino que también realicen los efectos secundarios
 *   esperados, como llamar a `createAuditLog` y `revalidatePath`.
 *
 * @relationships
 * - Valida el aparato `lib/actions/sites.actions.ts`.
 * - Su correcto funcionamiento es crítico para la fiabilidad de componentes de UI como
 *   `CreateSiteForm.tsx` y el hook `useSitesManagement.ts`, que dependen de estas acciones.
 *
 * @expectations
 * - Se espera que esta suite falle si se introduce una regresión en la lógica de negocio,
 *   los permisos, la validación de datos o el manejo de errores de las acciones de `sites`.
 *   Actúa como una red de seguridad automatizada para una de las entidades de datos
 *   más fundamentales de la aplicación.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar esta suite de pruebas de la capa de acciones.
 *
 * 1.  **Factoría de Mocks Compartida:** Mover las funciones y patrones de simulación (como el `mockSupabaseClient`) a un archivo de utilidad de pruebas compartido (`lib/test/utils.ts`) para reutilizarlos en todas las suites de pruebas de acciones, adhiriéndose al principio DRY.
 * 2.  **Pruebas de Límites de Planes:** Una vez que el sistema de facturación esté implementado, añadir pruebas que verifiquen que `createSiteAction` falla si el usuario intenta crear más sitios de los permitidos por su plan de suscripción.
 * 3.  **Validación de `FormData` con Zod:** Importar los esquemas de Zod de las acciones y usarlos para validar los `FormData` de prueba y los objetos de resultado, asegurando que las pruebas se mantengan alineadas con los contratos de datos de la aplicación.
 */
