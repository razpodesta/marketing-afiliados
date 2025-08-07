// tests/utils/render.tsx
/**
 * @file render.tsx
 * @description Envoltura (Wrapper) personalizada y de élite para `render` de RTL.
 *              Ha sido blindada con `jest-axe` para ejecutar auditorías de
 *              accesibilidad automáticas en cada componente renderizado. Su
 *              entorno de tipos ha sido corregido con la instalación de
 *              `@types/jest-axe` y una declaración de tipos personalizada.
 * @author L.I.A Legacy
 * @version 2.1.0 (Type-Safe A11y Auditing)
 */
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React, { type ReactElement } from "react";
import { expect } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";

// Extender los matchers de Vitest/Jest con el de accesibilidad.
// Esto ahora funciona gracias a @types/jest-axe y tests/vitest.d.ts
expect.extend(toHaveNoViolations);

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const customRender = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): Promise<RenderResult> => {
  const renderResult = render(ui, { wrapper: AllTheProviders, ...options });
  const results = await axe(renderResult.container);
  expect(results).toHaveNoViolations();
  return renderResult;
};

export * from "@testing-library/react";
export { customRender as render };

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Corrección de Entorno de Tipos**: ((Implementada)) La instalación de `@types/jest-axe` y la creación de `tests/vitest.d.ts` resuelven los errores de compilación `TS7016` y `TS2339`, estabilizando la infraestructura de pruebas de accesibilidad.
 *
 * @subsection Melhorias Futuras
 * 1.  **Configuración de Reglas de Axe**: ((Vigente)) Se pueden configurar reglas específicas de `axe-core` para ignorar ciertas violaciones (con justificación) o para enfocarse en niveles de conformidad específicos (AA, AAA).
 */
// tests/utils/render.tsx
