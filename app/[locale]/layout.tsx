// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react"; // Añadimos SessionProvider
import { Toaster } from "react-hot-toast"; // Añadimos Toaster para notificaciones

export default async function LocaleLayout({
  children,
  params, // <-- RECIBE `params` como una promesa
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // <-- USA `await` para resolver la promesa

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Error loading i18n messages:", error);
    messages = {};
  }

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Toaster position="bottom-right" />
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
/* MEJORAS PROPUESTAS
 * 1. **SessionProvider:** Envolver `children` con el `SessionProvider` de `next-auth/react` aquí es la estrategia ideal, ya que tanto el admin como potencialmente otras páginas podrían necesitar acceder a la sesión en el cliente.
 * 2. **Layouts Anidados para UI:** Si el panel de administración necesita una barra lateral, se puede crear un `app/[locale]/admin/layout.tsx` que NO llame a `getMessages`, sino que simplemente envuelva a sus `{children}` con los componentes de la UI del dashboard. Next.js lo anidará limpiamente dentro de este layout principal.
 * 1. **Metadata Dinámica:** Hacer que `title` y `description` en `metadata` sean dinámicos utilizando `generateMetadata` y `next-intl` para que se traduzcan según el idioma.
 * 2. **Gestión de Zonas Horarias:** Configurar `timeZone` en `NextIntlClientProvider` para manejar correctamente las fechas y horas en diferentes regiones.
 */
