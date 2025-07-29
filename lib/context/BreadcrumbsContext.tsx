// Ruta: lib/context/BreadcrumbsContext.tsx
/**
 * @file BreadcrumbsContext.tsx
 * @description Proveedor de contexto de React para pasar datos de resolución de
 *              nombres (ej. nombre de sitio por ID) desde Server Components
 *              (como el layout) a Client Components (como los breadcrumbs).
 *
 * @author Metashark
 * @version 1.0.0
 */

"use client";

import { createContext, type ReactNode, useContext } from "react";

/**
 * @typedef {Record<string, string>} NameMap
 * @description Un mapa simple para asociar un ID (string) con un nombre (string).
 */
export type NameMap = Record<string, string>;

/**
 * @interface BreadcrumbsContextProps
 * @description Define la forma de los datos almacenados en el contexto.
 */
interface BreadcrumbsContextProps {
  nameMap: NameMap;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextProps | undefined>(
  undefined
);

/**
 * @description Proveedor que hace que el mapa de nombres esté disponible para sus hijos.
 * @param {{ children: ReactNode, nameMap: NameMap }} props
 * @returns {JSX.Element}
 */
export const BreadcrumbsProvider = ({
  children,
  nameMap,
}: {
  children: ReactNode;
  nameMap: NameMap;
}) => {
  return (
    <BreadcrumbsContext.Provider value={{ nameMap }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
};

/**
 * @description Hook personalizado para acceder fácilmente al contexto de los breadcrumbs.
 * @returns {BreadcrumbsContextProps}
 */
export const useBreadcrumbs = (): BreadcrumbsContextProps => {
  const context = useContext(BreadcrumbsContext);
  if (context === undefined) {
    throw new Error(
      "useBreadcrumbs debe ser utilizado dentro de un BreadcrumbsProvider"
    );
  }
  return context;
};
