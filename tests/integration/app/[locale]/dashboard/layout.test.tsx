// tests/app/[locale]/dashboard/layout.test.tsx
/**
 * @file layout.test.tsx
 * @description Arnés de pruebas de alta fidelidad para el `DashboardLayout`.
 *              Ha sido refactorizado para alinearse con la nueva arquitectura
 *              desacoplada del componente, simulando la capa de datos en lugar
 *              de la API de Supabase. Esto resuelve todos los fallos de prueba
 *              anteriores y crea una suite estable y mantenible.
 * @author L.I.A. Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 9.0.0 (Data Layer Mocking & Final Stability)
 */
import { render, screen, waitFor } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DashboardLayout from "@/app/[locale]/dashboard/layout";
import {
  DashboardProvider,
  useDashboard,
} from "@/lib/context/DashboardContext";
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
// Ahora simulamos la capa de datos, no el cliente de Supabase.
import { modules, notifications, workspaces } from "@/lib/data";
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { getMockLayoutData } from "@/lib/dev/mock-session";
import { createClient } from "@/lib/supabase/server";

// --- Simulación de Dependencias ---
vi.mock("next/navigation");
vi.mock("next/cache", () => ({ unstable_cache: vi.fn((fn) => fn) }));
vi.mock("next/headers");
vi.mock("@/lib/supabase/server"); // Aún necesario para la sesión
vi.mock("@/lib/data"); // Simulamos toda la capa de datos
vi.mock("@/lib/dev/mock-session");
vi.mock("@/components/layout/DashboardSidebar", () => ({
  DashboardSidebar: () => null,
}));
vi.mock("@/components/layout/DashboardHeader", () => ({
  DashboardHeader: () => null,
}));
vi.mock("@/components/feedback/LiaChatWidget", () => ({
  LiaChatWidget: () => null,
}));
vi.mock("@/components/feedback/CommandPalette", () => ({
  CommandPalette: () => null,
}));

// --- Componente de Consumo de Prueba ---
const TestConsumer = () => {
  const context = useDashboard();
  return <div data-testid="context-value">{JSON.stringify(context)}</div>;
};

describe("Arnés de Pruebas: tests/app/[locale]/dashboard/layout.test.tsx", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("process", {
      env: { ...process.env, DEV_MODE_ENABLED: "false" },
    });
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    } as any);
    vi.mocked(cookies).mockReturnValue({ get: () => undefined } as any);
    // Mocks por defecto para la capa de datos
    vi.mocked(workspaces.getWorkspacesByUserId).mockResolvedValue([]);
    vi.mocked(notifications.getPendingInvitationsByEmail).mockResolvedValue([]);
    vi.mocked(modules.getFeatureModulesForUser).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Onboarding: debe redirigir a /welcome si el usuario no tiene workspaces ni invitaciones", async () => {
    // Arrange: Los mocks por defecto ya cumplen esta condición.
    await DashboardLayout({ children: <div /> });
    expect(redirect).toHaveBeenCalledWith("/welcome");
  });

  it("Selección de Contexto: debe seleccionar el workspace de la cookie si es válido", async () => {
    // Arrange
    const mockWorkspacesData = [
      { id: "ws-1", name: "Incorrecto" },
      { id: "ws-cookie", name: "Correcto" },
    ];
    vi.mocked(workspaces.getWorkspacesByUserId).mockResolvedValue(
      mockWorkspacesData as any
    );
    vi.mocked(cookies).mockReturnValue({
      get: (name: string) =>
        name === "active_workspace_id" ? { value: "ws-cookie" } : undefined,
    } as any);

    // Act
    const LayoutComponent = await DashboardLayout({
      children: <TestConsumer />,
    });
    if (!LayoutComponent) throw new Error("Layout no debe ser nulo");
    render(
      <DashboardProvider value={LayoutComponent.props.value}>
        {LayoutComponent.props.children}
      </DashboardProvider>
    );

    // Assert
    await waitFor(() => {
      const contextData = JSON.parse(
        screen.getByTestId("context-value").textContent!
      );
      expect(contextData.activeWorkspace.name).toBe("Correcto");
    });
  });

  it("Selección de Contexto: debe seleccionar el primer workspace si la cookie no existe o no es válida", async () => {
    // Arrange
    const mockWorkspacesData = [
      { id: "ws-1", name: "Primer Workspace" },
      { id: "ws-2", name: "Segundo" },
    ];
    vi.mocked(workspaces.getWorkspacesByUserId).mockResolvedValue(
      mockWorkspacesData as any
    );
    vi.mocked(cookies).mockReturnValue({
      get: () => ({ value: "ws-invalido" }),
    } as any);

    // Act
    const LayoutComponent = await DashboardLayout({
      children: <TestConsumer />,
    });
    if (!LayoutComponent) throw new Error("Layout no debe ser nulo");
    render(
      <DashboardProvider value={LayoutComponent.props.value}>
        {LayoutComponent.props.children}
      </DashboardProvider>
    );

    // Assert
    await waitFor(() => {
      const contextData = JSON.parse(
        screen.getByTestId("context-value").textContent!
      );
      expect(contextData.activeWorkspace.name).toBe("Primer Workspace");
    });
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Prueba de Modo DEV**: ((Vigente)) Añadir una prueba que establezca `DEV_MODE_ENABLED` en `true` y verifique que `getMockLayoutData` es llamado.
 * 2. **Prueba de Invitaciones Pendientes**: ((Vigente)) Añadir una prueba que simule la presencia de invitaciones y verifique que el usuario NO es redirigido a `/welcome`.
 *
 * @subsection Mejoras Implementadas
 * 1. **Simulación de Capa de Datos**: ((Implementada)) Se ha refactorizado la suite para simular la capa de datos (`lib/data`) en lugar de Supabase, resolviendo el `TypeError` de forma definitiva y creando pruebas más estables y mantenibles.
 */
// tests/app/[locale]/dashboard/layout.test.tsx
