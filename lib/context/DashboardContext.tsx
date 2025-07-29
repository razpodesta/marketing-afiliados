// Ruta: lib/context/DashboardContext.tsx
/**
 * @file DashboardContext.tsx
 * @description Proveedor de contexto para compartir datos globales a través de
 *              todos los componentes del dashboard (sesión, workspaces, módulos).
 *              Este aparato es la fuente de verdad para el estado del layout.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.0.0 (Lean Context Refactoring)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext } from "react";

import type { FeatureModule } from "@/lib/data/modules";
import type { Tables } from "@/lib/types/database";

type Workspace = Tables<"workspaces">;
type Invitation = {
  id: string;
  status: string;
  workspaces: { name: string; icon: string | null } | null;
};

/**
 * @interface DashboardContextProps
 * @description Define la forma de los datos globales compartidos en el contexto del dashboard.
 *              REFACTORIZACIÓN: Se han eliminado los datos específicos de página (`sites`, `totalCount`)
 *              para que el contexto sea puramente global, mejorando el rendimiento y la separación de conceptos.
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
 * @description Proveedor que hace que los datos globales del dashboard estén disponibles para sus hijos.
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

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la gestión de estado global.
 *
 * 1.  **Separación de Contextos:** (Revalidado) A medida que la aplicación crezca, este contexto podría dividirse en contextos más especializados (ej. `SessionContext`, `WorkspaceContext`) para optimizar aún más los re-renders.
 * 2.  **Acciones en el Contexto:** (Revalidado) El contexto podría evolucionar para incluir no solo datos, sino también funciones para modificar esos datos (ej. `setActiveWorkspace`), convirtiéndolo en un mini-store de estado en lugar de un simple proveedor de datos estáticos.
 * 3.  **Integración con Zustand:** Para una gestión de estado más compleja y desacoplada de la jerarquía de React, el estado de este contexto podría ser movido a un store de Zustand, y este proveedor simplemente hidrataría el store en el servidor.
 */

/**
 * @fileoverview El aparato `DashboardContext` es el sistema circulatorio de datos para la sección autenticada de la aplicación.
 * @functionality
 * - Utiliza el patrón de Contexto de React para proporcionar datos globales (sesión de usuario, lista de workspaces, etc.) a todos los componentes anidados dentro del `DashboardLayout` sin necesidad de "prop drilling".
 * - Define un contrato de tipos estricto (`DashboardContextProps`) para los datos que provee.
 * - Exporta un hook personalizado (`useDashboard`) que asegura que el contexto solo pueda ser consumido por componentes que son descendientes del proveedor, previniendo errores en tiempo de ejecución.
 * @relationships
 * - Es provisto por el `DashboardLayout` (`app/[locale]/dashboard/layout.tsx`), que es el responsable de obtener los datos del servidor.
 * - Es consumido por múltiples componentes de cliente a lo largo del dashboard, como `DashboardHeader.tsx`, `DashboardSidebar.tsx` y `WorkspaceSwitcher.tsx`, que dependen de estos datos globales para renderizarse.
 * @expectations
 * - Se espera que este aparato contenga únicamente datos que son verdaderamente globales para toda la experiencia del dashboard. No debe ser contaminado con datos específicos de una página, ya que eso causaría re-renders innecesarios y acoplaría el layout a sus páginas hijas.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Separación de Contextos: A medida que la aplicación crezca, este contexto puede volverse muy grande. Podría dividirse en contextos más pequeños y especializados (ej. `SessionContext`, `WorkspaceContext`, `PageDataContext`) para mejorar la granularidad y optimizar los re-renders.
 * 2. Acciones en el Contexto: El contexto podría incluir no solo datos, sino también funciones para modificar esos datos (ej. `setActiveWorkspace`), convirtiéndolo en un mini-store de estado en lugar de un simple proveedor de datos estáticos.
 */
