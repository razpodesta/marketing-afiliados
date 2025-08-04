// tests/utils/render.tsx
/**
 * @file render.tsx
 * @description Envoltura (Wrapper) personalizada para la función `render` de React Testing Library.
 *              Este aparato garantiza que todos los componentes bajo prueba se rendericen
 *              dentro de los proveedores de contexto necesarios (ej. `TooltipProvider`),
 *              evitando errores y código repetitivo en las pruebas.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { render, type RenderOptions } from "@testing-library/react";
import React, { type ReactElement } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

/**
 * @calificacion 10/10
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Aislamiento de Proveedores**: ((Implementada)) Abstrae la necesidad de envolver cada componente en proveedores, manteniendo las pruebas limpias y enfocadas en la lógica del componente.
 *
 * @subsection Melhorias Futuras
 * 1. **Proveedor de Contexto Dinámico**: ((Vigente)) La función `customRender` podría ser extendida para aceptar un `contextValue` opcional, permitiendo a las pruebas individuales sobrescribir los valores de un contexto específico (ej. `DashboardContext`) para validar diferentes escenarios de la UI.
 */
// tests/utils/render.tsx
