// Ruta: lib/context/SessionContext.tsx
/**
 * @file SessionContext.tsx
 * @description Proveedor de contexto de React para pasar datos de sesión y
 *              de la aplicación (usuario, workspaces, invitaciones, etc.)
 *              desde Server Components (como el layout) a Client Components.
 *
 * @author Metashark
 * @version 1.0.0
 */
"use client";

import { type User } from "@supabase/supabase-js";
import { createContext, useContext, type ReactNode } from "react";

type Workspace = {
  id: string;
  name: string;
  icon: string | null;
};

type Invitation = {
  id: string;
  status: string;
  workspaces: {
    name: string;
    icon: string | null;
  } | null;
};

/**
 * @interface SessionContextProps
 * @description Define la forma de los datos almacenados en el contexto de sesión.
 */
interface SessionContextProps {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  pendingInvitations: Invitation[];
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

/**
 * @description Proveedor que hace que los datos de la sesión estén disponibles para sus hijos.
 * @param {{ children: ReactNode } & SessionContextProps} props
 * @returns {JSX.Element}
 */
export const SessionProvider = ({
  children,
  ...props
}: { children: ReactNode } & SessionContextProps) => {
  return (
    <SessionContext.Provider value={props}>{children}</SessionContext.Provider>
  );
};

/**
 * @description Hook personalizado para acceder fácilmente al contexto de la sesión.
 * @returns {SessionContextProps}
 */
export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      "useSession debe ser utilizado dentro de un SessionProvider"
    );
  }
  return context;
};
