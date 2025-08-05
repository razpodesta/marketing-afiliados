// app/[locale]/layout.tsx
/**
 * @file app/[locale]/layout.tsx
 * @description Layout Canónico de Contexto y Estilo.
 *              Este es el layout principal que envuelve todas las páginas
 *              localizadas. Es responsable de la internacionalización,
 *              la gestión de temas, fuentes y todos los proveedores de contexto.
 *              Ahora integra el nuevo Client Component para iniciar la telemetría
 *              de huella digital del navegador.
 * @author L.I.A. Legacy
 * @version 7.0.0 (Client-Side Telemetry Integration - Externalized Component)
 */
import "../globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import React from "react";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/ThemeProvider";
// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { TelemetryClientLogger } from "@/components/telemetry/TelemetryClientLogger"; // Importa el nuevo Client Component
// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---
import { locales } from "@/lib/navigation";

// La metadata se puede mantener aquí, ya que Next.js la fusionará.
export const metadata: Metadata = {
  title: "Metashark - Plataforma de Marketing de Afiliados",
  description:
    "Crea, gestiona y optimiza tus campañas de marketing de afiliados en minutos.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

/**
 * @function generateStaticParams
 * @description Genera los parámetros estáticos para las rutas internacionalizadas.
 *              Utilizado por Next.js para el Static Site Generation (SSG) de layouts.
 * @returns {Array<{ locale: string }>} Un array de objetos con cada locale soportado.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * @async
 * @function LocaleLayout
 * @description Layout de React Server Component que provee la infraestructura
 *              global para todas las páginas internacionalizadas.
 *              Es el punto de montaje de los proveedores de contexto globales
 *              y el iniciador de la telemetría del lado del cliente.
 * @param {{ children: React.ReactNode; params: { locale: string } }} props - Propiedades del layout.
 * @param {React.ReactNode} props.children - Los componentes hijos a renderizar dentro de este layout.
 * @param {object} props.params - Parámetros de la ruta, conteniendo el `locale` actual de la URL.
 * @returns {Promise<JSX.Element>} El layout renderizado con los proveedores y el componente de telemetría.
 */
export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Guarda de seguridad: si el `locale` extraído de la URL no es uno de los soportados,
  // la aplicación responde con una página de "no encontrado" (404).
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Establece el locale actual para `next-intl` en el entorno de servidor.
  // Esto es crucial para que las traducciones en Server Components funcionen correctamente.
  unstable_setRequestLocale(locale);

  let messages;
  try {
    // Carga dinámicamente el archivo de mensajes de traducción para el `locale` actual.
    // Utiliza un alias (`@/messages`) para una ruta de importación robusta.
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    // En caso de que el archivo de mensajes no se encuentre o esté corrupto,
    // se loguea un error crítico y se devuelve una página 404 para evitar un fallo total de la aplicación.
    console.error(
      `Error crítico al cargar el archivo de mensajes para el locale "${locale}":`,
      error
    );
    notFound();
  }

  return (
    <html lang={locale} className={GeistSans.className}>
      <body className="antialiased">
        {/* Proveedor de `next-intl` para que los componentes de cliente puedan acceder a las traducciones. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Proveedor de temas (`next-themes`) para la funcionalidad de Light/Dark mode. */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* Componente de `react-hot-toast` para mostrar notificaciones pop-up en la UI. */}
            <Toaster position="bottom-right" />

            {children}

            {/* Inicia la lógica de telemetría del lado del cliente.
                Este componente de cliente se monta en todas las páginas internacionalizadas. */}
            <TelemetryClientLogger />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Extracción de `TelemetryClientLogger`**: ((Implementada)) Se ha movido la lógica de cliente a un componente separado (`components/telemetry/TelemetryClientLogger.tsx`) y se ha importado aquí. Esto resuelve el error `useState only works in Client Components` y mantiene este layout como Server Component.
 *
 * @subsection Melhorias Futuras
 * 1. **Carga Diferida de `TelemetryClientLogger`**: ((Vigente)) Para una optimización extrema del LCP (Largest Contentful Paint) en la landing page, el `TelemetryClientLogger` podría ser cargado de forma dinámica (`next/dynamic`) con `ssr: false` y un ligero retraso (ej., 500ms), si se observa que la inicialización de `FingerprintJS` impacta negativamente esta métrica crítica de UX.
 * 2. **Sincronización de `sessionId` para Cliente**: ((Vigente)) Refinar la lógica para que el `TelemetryClientLogger` lea la `metashark_session_id` establecida por el middleware (disponible en las cookies del cliente) y la envíe en su payload a la Server Action. Esto permitiría una correlación perfecta entre los logs del servidor (middleware) y los logs de cliente (huella digital) para la misma sesión de usuario.
 */
// app/[locale]/layout.tsx
