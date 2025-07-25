// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // La importación correcta
import "./globals.css";

export const metadata: Metadata = {
  title: "Metashark",
  description: "Multi-tenant SaaS platform by Metashark",
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} className={GeistSans.className}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
/* MEJORAS PROPUESTAS
 * 1. **SessionProvider:** Envolver `children` con el `SessionProvider` de `next-auth/react`. Es la mejor práctica para dar acceso reactivo a la sesión a los Componentes de Cliente sin necesidad de pasar props.
 * 2. **Layouts de UI Anidados:** Para añadir una barra lateral al admin, ahora puedes crear de forma segura un archivo `app/admin/layout.tsx` que contenga solo los componentes de la UI (Header, Sidebar, etc.) y envuelva a `{children}`.
 */
