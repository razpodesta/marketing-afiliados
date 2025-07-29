// app/[locale]/page.tsx
/**
 * @file Página de Inicio Pública (Landing Page)
 * @description Esta es la página de marketing principal.
 * @refactor
 * REFACTORIZACIÓN MODO DESARROLLO:
 * 1. Se ha añadido un "interruptor" que, si `DEV_MODE_ENABLED` está activo,
 *    simula una sesión de usuario existente y redirige inmediatamente al dashboard.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.0.0 (Developer Mode Integration)
 */
import { redirect } from "next/navigation";

import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { CursorTrail } from "@/components/ui/CursorTrail";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  // --- INTERRUPTOR DEL MODO DE DESARROLLO ---
  if (process.env.DEV_MODE_ENABLED === "true") {
    redirect("/dashboard");
  }
  // --- FIN DEL INTERRUPTOR ---

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CursorTrail />
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <LandingFooter />
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Testing de Variantes de Landing en Dev Mode: El modo de desarrollo podría usarse para forzar la visualización de diferentes variantes de la página de inicio para pruebas A/B, leyendo un parámetro de la URL (ej. `/?variant=b`) y renderizando un componente Hero o Features alternativo.
 */

/* Ruta: app/[locale]/page.tsx */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Carga de Sesión Optimizada: La llamada `getSession()` se realiza aquí y también en el `middleware`. Para optimizar en el borde, se podría pasar la información de la sesión desde el middleware a la página a través de cabeceras de petición personalizadas, evitando una lectura duplicada de la cookie.
 * 2. Pruebas A/B en la Sección Hero: La sección `Hero` es la más crítica para la conversión. Se podría implementar un sistema de pruebas A/B (utilizando Vercel Edge Config o una herramienta de terceros como Optimizely) para renderizar diferentes versiones del componente `Hero` a diferentes segmentos de usuarios y medir cuál convierte mejor.
 * 3. Landing Page Alternativa para Usuarios Autenticados: En lugar de una redirección inmediata, una estrategia alternativa es mostrar una versión ligeramente modificada de la landing para usuarios que ya han iniciado sesión. Por ejemplo, el `LandingHeader` podría mostrar "Ir al Dashboard" y la sección `Hero` un mensaje de bienvenida personalizado, manteniendo el resto del contenido por si el usuario busca información sobre nuevas características.
 */
/* MEJORAS PROPUESTAS
 * 1. **Carga de Sesión Optimizada:** La llamada `getSession()` se realiza aquí y también en el middleware. Para optimizar, se podría pasar la información de la sesión desde el middleware a la página a través de cabeceras de petición, evitando una consulta duplicada a la base de datos o a la cookie.
 * 2. **Página de Carga (Loading UI):** Añadir un archivo `loading.tsx` en esta ruta (`app/[locale]/loading.tsx`) que muestre un esqueleto de la landing page. Esto mejoraría la experiencia de usuario percibida mientras se ejecuta la lógica del servidor (como la comprobación de sesión).
 * 3. **Landing Page para Usuarios Autenticados:** Una alternativa a la redirección es mostrar una versión diferente de la landing page para usuarios autenticados. El `LandingHeader` podría cambiar para mostrar "Ir al Dashboard", y la sección `Hero` podría dar un mensaje de bienvenida personalizado. Esto puede ser útil si la landing page también contiene información relevante para usuarios existentes (ej. anuncios de nuevas características).
 * 1. **Reactivación de la Lógica de Sesión:** Es CRÍTICO reactivar (descomentar) la lógica de `createClient` y `redirect` antes de pasar a producción. Los usuarios autenticados deben ser dirigidos al dashboard para una UX adecuada.
 * 2. **Prueba A/B del Hero:** La sección Hero es la más importante para la conversión. Se podría implementar un sistema de pruebas A/B (usando Vercel Edge Config o una herramienta similar) para probar diferentes titulares o llamadas a la acción y medir cuál funciona mejor.
 * 3. **SEO Estructurado (JSON-LD):** Añadir un script de tipo `application/ld+json` en el `head` de la página (a través de la función `generateMetadata`) para proporcionar datos estructurados a los motores de búsqueda, mejorando la visibilidad y la apariencia en los resultados de búsqueda.
 * 1. **Carga Dinámica de Secciones (Lazy Loading):** Las secciones que no están en la vista inicial (como `Features` y `Footer`) pueden ser cargadas dinámicamente usando `next/dynamic`. Esto mejoraría el LCP (Largest Contentful Paint) de la página.
 * 2. **Prueba Social y Testimonios:** Crear y añadir una sección de "Testimonios" que cargue datos desde una tabla de Supabase. Esto aumentaría la credibilidad y la tasa de conversión.
 * 3. **Sección de Precios (Pricing):** Diseñar e implementar una sección de precios con diferentes planes, conectada a una lógica de suscripción (potencialmente con Stripe y Supabase) como un paso futuro clave para la monetización.
 * 4. **Reactivar la Redirección:** Una vez finalizado el trabajo de diseño, es CRUCIAL descomentar la lógica de redirección para que los usuarios autenticados sean dirigidos directamente a su dashboard, como se espera en una aplicación SaaS.
 * 1. **Llamada a la Acción Dinámica:** Modificar el componente `LandingHeader` para que acepte una prop `isLoggedIn` y muestre "Ir al Dashboard" en lugar de "Iniciar Sesión".
 * 2. **Contenido Dinámico:** Cargar contenido dinámico para la landing page (como testimonios o posts de blog) desde Supabase.
 * 1. **Llamada a la Acción Dinámica:** Modificar el componente `Header` para que acepte una prop `isLoggedIn` y muestre "Ir al Dashboard" en lugar de "Iniciar Sesión".
 * 2. **Contenido Dinámico:** Cargar contenido dinámico para la landing page (como testimonios o posts de blog) desde Supabase.
 * 1. **Aplicar Estilos de Shadcn/UI:** Reemplazar los divs genéricos con los componentes de Shadcn/UI como `<Card>`, `<CardHeader>`, `<CardContent>` para unificar el estilo visual con el resto de la aplicación.
 * 2. **Llamada a la Acción Dinámica:** Obtener la sesión en el servidor y si el usuario está autenticado, cambiar el enlace "Admin" por "Ir al Dashboard".
 * 1. **Carga Asíncrona:** El componente `SubdomainForm` es un candidato ideal para ser cargado de forma dinámica con `next/dynamic` para mejorar la métrica LCP (Largest Contentful Paint) de la página principal.
 * 2. **Estado de Autenticación:** Mostrar "Ir al Dashboard" en lugar de "Admin" si el usuario ya ha iniciado sesión. Esto se puede lograr leyendo la sesión en el servidor.
 */
