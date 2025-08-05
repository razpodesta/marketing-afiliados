// app/layout.tsx
/**
 * @file app/layout.tsx
 * @description Layout Raíz Mínimo y Global.
 *              Su única responsabilidad es definir la estructura HTML base
 *              (`<html>` y `<body>`), satisfaciendo el requisito fundamental de
 *              Next.js. No contiene proveedores de contexto para evitar
 *              conflictos con la internacionalización.
 * @author L.I.A. Legacy
 * @version 1.0.0
 */
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Las props `params: { locale: string }` no se reciben aquí,
  // se reciben en el layout anidado `app/[locale]/layout.tsx`.
  return (
    // El `lang` se definirá en el layout del locale.
    // El `className` de la fuente también se moverá allí.
    <html>
      <body>{children}</body>
    </html>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Estabilidad de Compilación**: ((Implementada)) La existencia de este archivo resuelve el error de build "doesn't have a root layout" para páginas especiales como `not-found.tsx`.
 * 2. **Separación de Responsabilidades**: ((Implementada)) Este layout ahora sigue estrictamente el Principio de Responsabilidad Única.
 */
// app/layout.tsx
