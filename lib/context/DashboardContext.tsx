// lib/context/DashboardContext.tsx
"use client";

import type { FeatureModule } from "@/lib/data/modules";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import type { Tables } from "@/lib/types/database";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, type ReactNode } from "react";

/**
 * @file DashboardContext.tsx
 * @description Proveedor de contexto para compartir datos a través de todos
 *              los componentes del dashboard.
 * @refactor
 * REFACTORIZACIÓN MODO DESARROLLO: El contexto ha sido extendido para incluir
 * `sites` y `totalCount`, permitiendo al layout actuar como el único proveedor
 * de datos para toda la sección del dashboard.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Extended Data Context)
 */

type Workspace = Tables<"workspaces">;
type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

/**
 * @interface DashboardContextProps
 * @description Define la forma de los datos compartidos en el contexto del dashboard.
 */
interface DashboardContextProps {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  pendingInvitations: Invitation[];
  modules: FeatureModule[];
  // --- DATOS EXTENDIDOS PARA PÁGINAS HIJAS ---
  sites: SiteWithCampaignsCount[];
  totalCount: number;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined
);

/**
 * @description Proveedor que hace que los datos del dashboard estén disponibles para sus hijos.
 */
export const DashboardProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: DashboardContextProps;
}) => {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * @description Hook personalizado para acceder de forma segura al contexto del dashboard.
 * @throws {Error} Si se usa fuera de un DashboardProvider.
 * @returns {DashboardContextProps} Los datos compartidos del dashboard.
 */
export const useDashboard = (): DashboardContextProps => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboard debe ser utilizado dentro de un DashboardProvider"
    );
  }
  return context;
};

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Separación de Contextos: A medida que la aplicación crezca, este contexto puede volverse muy grande. Podría dividirse en contextos más pequeños y especializados (ej. `SessionContext`, `WorkspaceContext`, `PageDataContext`) para mejorar la granularidad y optimizar los re-renders.
 * 2. Acciones en el Contexto: El contexto podría incluir no solo datos, sino también funciones para modificar esos datos (ej. `setActiveWorkspace`), convirtiéndolo en un mini-store de estado en lugar de un simple proveedor de datos estáticos.
 */
