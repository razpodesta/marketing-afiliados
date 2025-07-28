// Ruta: lib/context/DashboardContext.tsx
/**
 * @file DashboardContext.tsx
 * @description Proveedor de contexto para compartir datos de sesión y de la
 *              aplicación a través de todos los componentes del dashboard.
 *              Este patrón evita el "prop drilling" y crea una única fuente
 *              de verdad para los datos obtenidos en el layout del servidor.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/lib/types/database";
import type { FeatureModule } from "@/app/[locale]/dashboard/dashboard-client";
import { createContext, useContext, type ReactNode } from "react";

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
}

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined
);

/**
 * @description Proveedor que hace que los datos del dashboard estén disponibles para sus hijos.
 * @param {object} props
 * @returns {JSX.Element}
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
