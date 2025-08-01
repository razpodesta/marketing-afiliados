// lib/context/__mocks__/DashboardContext.tsx
/**
 * @file DashboardContext.tsx (Mock)
 * @description Módulo de simulación para el DashboardContext.
 *              Exporta un `MockDashboardProvider` configurable que permite
 *              a las pruebas controlar el contexto provisto y espiar sus props.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import React from "react";
import { vi } from "vitest";

// Creamos un spy que podemos importar y controlar desde nuestras pruebas.
export const mockProviderSpy = vi.fn();

// El mock del Provider.
export const DashboardProvider = ({
  value,
  children,
}: {
  value: any;
  children: React.ReactNode;
}) => {
  // El spy captura el valor con el que fue llamado.
  mockProviderSpy(value);
  // Renderiza a los hijos para que la prueba pueda continuar.
  return <>{children}</>;
};

// Mock del hook para evitar errores si un componente hijo lo llama.
export const useDashboard = vi.fn(() => ({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  pendingInvitations: [],
  modules: [],
}));
