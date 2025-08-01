// app/[locale]/dashboard/layout.test.tsx
/**
 * @file layout.test.tsx
 * @description Arnés de pruebas de alta fidelidad y definitivo para el `DashboardLayout`.
 *              Corregido para manejar de forma segura los tipos de retorno nulos,
 *              alineando las pruebas con la lógica de programación defensiva del componente.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 5.2.0 (Null-Safe Type Guarding)
 */
import { render, screen, waitFor } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect, usePathname } from "next/navigation";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useDashboard,
  DashboardProvider,
} from "@/lib/context/DashboardContext";
import { modules, workspaces } from "@/lib/data";
import { getMockLayoutData } from "@/lib/dev/mock-session";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "./layout";

// --- Simulación de Dependencias ---
vi.mock("next/navigation");
vi.mock("next/cache", () => ({ unstable_cache: vi.fn((fn) => fn) }));
vi.mock("next/headers");
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/data");
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

const mockUser = { id: "user-123", email: "test@example.com" };

const TestConsumer = () => {
  const context = useDashboard();
  return <div data-testid="context-value">{JSON.stringify(context)}</div>;
};

describe("Arnés de Pruebas Definitivo: DashboardLayout", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    const supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };
    mockSupabaseClient = supabaseMock;
    vi.mocked(createClient).mockReturnValue(supabaseMock as any);

    vi.stubGlobal("process", {
      ...process,
      env: { ...process.env, DEV_MODE_ENABLED: "false" },
    });
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    vi.mocked(cookies).mockReturnValue({ get: () => undefined } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Seguridad: debe redirigir al login si no hay usuario", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    const layoutPromise = DashboardLayout({ children: <div /> });
    await expect(layoutPromise).resolves.toBeNull();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("Onboarding: debe redirigir a /welcome si no hay workspaces ni invitaciones", async () => {
    vi.mocked(workspaces.getWorkspacesByUserId).mockResolvedValue([]);
    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      mockResolvedValue: { data: [], error: null },
    }));

    await DashboardLayout({ children: <div /> });
    expect(redirect).toHaveBeenCalledWith("/welcome");
  });

  it("Prueba del `DashboardProvider`: debe proveer los datos correctos al contexto", async () => {
    const mockWorkspacesData = [{ id: "ws-1", name: "Principal" }];
    vi.mocked(workspaces.getWorkspacesByUserId).mockResolvedValue(
      mockWorkspacesData as any
    );
    vi.mocked(modules.getFeatureModulesForUser).mockResolvedValue([]);

    const LayoutComponent = await DashboardLayout({
      children: <TestConsumer />,
    });

    // --- INICIO DE CORRECCIÓN (TS18047) ---
    if (!LayoutComponent) {
      throw new Error(
        "La prueba del Provider falló: El LayoutComponent no debería ser nulo aquí."
      );
    }
    // --- FIN DE CORRECCIÓN ---

    render(
      <DashboardProvider value={LayoutComponent.props.value}>
        {LayoutComponent.props.children}
      </DashboardProvider>
    );

    await waitFor(() => {
      const contextOutput = screen.getByTestId("context-value");
      const contextData = JSON.parse(contextOutput.textContent!);
      expect(contextData.user.id).toBe(mockUser.id);
      expect(contextData.workspaces[0].name).toBe("Principal");
    });
  });

  it("Prueba de `getMockLayoutData`: debe usar datos dev si DEV_MODE_ENABLED es true", async () => {
    process.env.DEV_MODE_ENABLED = "true";
    const mockDevData = {
      user: { id: "dev-user" },
      workspaces: [{ id: "dev-ws" }],
      activeWorkspace: { id: "dev-ws" },
      pendingInvitations: [],
      modules: [],
    };
    vi.mocked(getMockLayoutData).mockReturnValue(mockDevData as any);

    const LayoutComponent = await DashboardLayout({
      children: <TestConsumer />,
    });

    // --- INICIO DE CORRECCIÓN (TS18047) ---
    if (!LayoutComponent) {
      throw new Error(
        "La prueba de MockLayoutData falló: El LayoutComponent no debería ser nulo aquí."
      );
    }
    // --- FIN DE CORRECCIÓN ---

    render(
      <DashboardProvider value={LayoutComponent.props.value}>
        {LayoutComponent.props.children}
      </DashboardProvider>
    );

    await waitFor(() => {
      expect(getMockLayoutData).toHaveBeenCalledTimes(1);
      const contextData = JSON.parse(
        screen.getByTestId("context-value").textContent!
      );
      expect(contextData.user.id).toBe("dev-user");
    });
  });
});

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * 1.  **Prueba de Onboarding con Invitaciones**: (Vigente) Añadir un caso de prueba donde un usuario no tiene workspaces propios, pero sí tiene invitaciones pendientes.
 * 2.  **Factoría de Mocks Compartida**: (Vigente) Mover las funciones de creación de mocks y el `TestConsumer` a un archivo de utilidades de prueba.
 * 3.  **Prueba de Selección de Workspace Activo**: (Vigente) Simular diferentes valores en la cookie `active_workspace_id` y verificar que el `activeWorkspace` en el contexto se selecciona correctamente.
 */
// app/[locale]/dashboard/layout.test.tsx
