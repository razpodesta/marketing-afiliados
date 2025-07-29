// app/[locale]/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { logger } from "@/lib/logging";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";

/**
 * @file layout.tsx
 * @description Layout raíz específico del idioma. Este es el punto de control
 *              arquitectónico para la internacionalización y el theming.
 *              Provee el contexto de i18n a todos sus componentes hijos.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Robust Provider Setup)
 */
export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    logger.error("Error crítico al cargar los mensajes de i18n:", error);
    // En caso de fallo, proveemos un objeto vacío para evitar un crash total.
    // La UI mostrará las claves de traducción en lugar del texto.
    messages = {};
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="bottom-right" />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Gestión de Zona Horaria en `next-intl`: Para una internacionalización completa, se puede añadir la propiedad `timeZone` a `NextIntlClientProvider`. Esta zona horaria podría obtenerse de las preferencias del perfil del usuario en la base de datos o inferirse de la sesión, asegurando que todas las fechas y horas se muestren correctamente en la zona horaria local del usuario.
 * 2. Precarga de Assets Críticos: Para optimizar aún más el LCP (Largest Contentful Paint), se podrían añadir etiquetas `<link rel="preload">` en el `head` de este layout (a través de los metadatos) para las fuentes principales o imágenes críticas (como el logo), indicando al navegador que las descargue con alta prioridad.
 */
/* Ruta: app/[locale]/layout.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Proveedor de Estado Global: Este es el lugar ideal para inicializar un proveedor de estado global (como Zustand o Jotai). Podría gestionar estados que necesitan ser compartidos en toda la aplicación, como el perfil del usuario, notificaciones en tiempo real o el plan de suscripción activo, haciéndolos disponibles a través de un hook personalizado.
 * 2. Gestión de Zona Horaria en `next-intl`: Para una internacionalización completa, se puede añadir la propiedad `timeZone` a `NextIntlClientProvider`. Esta zona horaria podría obtenerse de las preferencias del perfil del usuario en la base de datos o inferirse de la sesión, asegurando que todas las fechas y horas se muestren correctamente en la zona horaria local del usuario.
 * 3. Precarga de Assets Críticos: Para optimizar aún más el LCP (Largest Contentful Paint), se podrían añadir etiquetas `<link rel="preload">` en el `head` de este layout (a través de los metadatos) para las fuentes principales o imágenes críticas (como el logo), indicando al navegador que las descargue con alta prioridad.
 */
/* MEJORAS PROPUESTAS
 * 1. **Proveedor de Estado Global:** Este es el lugar ideal para inicializar un proveedor de estado global (como Zustand o Jotai). Podría gestionar estados que necesitan ser compartidos en toda la aplicación, como el perfil del usuario, notificaciones o el plan de suscripción activo.
 * 2. **Precarga de Fuentes y Assets Críticos:** Para optimizar el LCP (Largest Contentful Paint), se pueden añadir etiquetas `<link rel="preload">` en el `head` de este layout para las fuentes principales o imágenes críticas, indicando al navegador que las descargue con alta prioridad.
 * 3. **Gestión de Zona Horaria en `next-intl`:** Para una internacionalización completa, se puede añadir la propiedad `timeZone` a `NextIntlClientProvider`, obteniéndola de las preferencias del usuario o de su sesión, para asegurar que todas las fechas y horas se muestren en su zona horaria local.
 * 1. **Proveedor de Temas:** Integrar un `ThemeProvider` para manejar temas claro/oscuro.
 * 2. **Gestión de Zonas Horarias:** Configurar `timeZone` en `NextIntlClientProvider` para una internacionalización completa de fechas.
 */

/* MEJORAS PROPUESTAS
 * 1. **Proveedor de Temas:** Si en el futuro se añade un tema oscuro/claro, este sería el lugar ideal para añadir el `ThemeProvider` (ej. de `next-themes`), envolviendo a `{children}`.
 * 2. **Gestión de Zonas Horarias:** Para una internacionalización completa, se puede configurar la propiedad `timeZone` en `NextIntlClientProvider` para asegurar que las fechas y horas se muestren correctamente según la región del usuario.
 */
