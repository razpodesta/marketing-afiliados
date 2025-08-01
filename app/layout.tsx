// Ruta: app/layout.tsx

import "./globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

/**
 * @file app/layout.tsx
 * @description Layout raíz de la aplicación. Define la estructura HTML base,
 * fuentes y metadatos globales.
 *
 * @author Metashark
 * @version 2.0.0 (Metadata Correction)
 */

// Metadatos globales para SEO y PWA.
// La inclusión de 'icons' aquí ayuda a Next.js a resolver correctamente el favicon.
export const metadata: Metadata = {
  title: "Metashark - Plataforma de Marketing de Afiliados",
  description:
    "Crea, gestiona y optimiza tus campañas de marketing de afiliados en minutos.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
/* MEJORAS FUTURAS DETECTADAS
 * 1. Datos Estructurados (JSON-LD): Para un SEO avanzado, se podría enriquecer la función `generateMetadata` para incluir un script de tipo `application/ld+json`. Esto proporcionaría a los motores de búsqueda información estructurada sobre la organización, mejorando la visibilidad en los resultados de búsqueda.
 * 2. Variables de CSS para Fuentes: Aunque el método actual es eficiente, una práctica arquitectónica alternativa es definir la fuente como una variable CSS en `globals.css` y luego aplicarla en la configuración de Tailwind. Esto centraliza aún más la gestión del tema y puede facilitar el uso de múltiples fuentes (ej. una para cuerpo, otra para encabezados).
 * 3. Inyección de Scripts de Analítica: Este es el lugar ideal para añadir los scripts de servicios de analítica (como Google Analytics, Vercel Analytics o PostHog) que necesitan estar presentes en todas las páginas de la aplicación.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Proveedor de Temas (Theming):** Integrar un `ThemeProvider` (ej. de `next-themes`) para permitir
 *    al usuario cambiar entre temas claro y oscuro, guardando su preferencia.
2.  **Metadatos Dinámicos:** Utilizar la función `generateMetadata` para hacer que el título y la
 *    descripción sean dinámicos y se traduzcan según el `locale`, mejorando el SEO internacional.
3.  **Variables de CSS para Fuentes:** Aunque `geist` se aplica a la clase del body, es una mejor práctica
 *    definirlo como una variable CSS (`--font-sans`) para poder aplicarlo más fácilmente en toda la UI
 *    a través de la configuración de Tailwind.
 * 1. **SessionProvider:** Envolver `children` con el `SessionProvider` de `next-auth/react`. Es la mejor práctica para dar acceso reactivo a la sesión a los Componentes de Cliente sin necesidad de pasar props.
 * 2. **Layouts de UI Anidados:** Para añadir una barra lateral al admin, ahora puedes crear de forma segura un archivo `app/admin/layout.tsx` que contenga solo los componentes de la UI (Header, Sidebar, etc.) y envuelva a `{children}`.
 */
