// app/[locale]/layout.tsx
/**
 * @file app/[locale]/layout.tsx
 * @description Layout Canónico de Contexto y Estilo. La telemetría del lado
 *              del cliente ha sido suspendida temporalmente.
 * @author L.I.A. Legacy
 * @version 8.0.0 (Client Telemetry Suspended)
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
// import { TelemetryClientLogger } from "@/components/telemetry/TelemetryClientLogger"; // TELEMETRÍA SUSPENDIDA
import { locales } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Metashark - Plataforma de Marketing de Afiliados",
  description:
    "Crea, gestiona y optimiza tus campañas de marketing de afiliados en minutos.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(
      `Error crítico al cargar el archivo de mensajes para el locale "${locale}":`,
      error
    );
    notFound();
  }

  return (
    <html lang={locale} className={GeistSans.className}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="bottom-right" />
            {children}
            {/* --- INICIO DE SUSPENSIÓN DE TELEMETRÍA --- */}
            {/* TODO: Reactivar la telemetría del cliente. */}
            {/* <TelemetryClientLogger /> */}
            {/* --- FIN DE SUSPENSIÓN DE TELEMETRÍA --- */}
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
 * 1. **Suspensión de Telemetría de Cliente**: ((Implementada)) Se ha comentado la renderización de `TelemetryClientLogger` para desactivar por completo la recolección de huellas digitales en el navegador y detener las llamadas a la Server Action fallida.
 *
 * @subsection Melhorias Futuras
 * 1. **Carga Diferida Condicional**: ((Vigente)) Cuando se reactive, `TelemetryClientLogger` debería ser cargado dinámicamente (`next/dynamic` con `ssr: false`) para no impactar el LCP.
 */
// app/[locale]/layout.tsx
