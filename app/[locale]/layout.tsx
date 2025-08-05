// app/[locale]/layout.tsx
/**
 * @file app/[locale]/layout.tsx
 * @description Layout Canónico de Contexto y Estilo.
 *              REFACTORIZADO: Corregida la capitalización en la ruta de importación
 *              de TelemetryClientLogger para resolver el fallo de build, manteniendo
 *              la integridad completa del aparato.
 * @author L.I.A. Legacy
 * @version 7.1.1 (Build Fix & Integrity Restoration)
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
import { TelemetryClientLogger } from "@/components/telemetry/TelemetryClientLogger";
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
 * 1. **Corrección de Build (Casing)**: ((Implementada)) Se ha corregido la capitalización de la ruta de importación.
 * 2. **Integridad Restaurada**: ((Implementada)) Se ha restaurado toda la funcionalidad original del aparato, eliminando la regresión.
 */
