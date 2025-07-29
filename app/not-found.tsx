// app/not-found.tsx
"use client";

import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { locales } from "@/navigation";

/**
 * @file not-found.tsx (Global & Autonomous)
 * @description Página 404 raíz y única. Es un Componente de Cliente autónomo
 *              que NO utiliza hooks de `next-intl` para evitar errores de contexto.
 *              Determina el locale a partir de la URL para construir enlaces de
 *              retorno correctos.
 * @author L.I.A Legacy
 * @version 6.0.0 (Autonomous 404 Architecture)
 */
export default function NotFound() {
  const pathname = usePathname();

  // Lógica de cliente segura para determinar el locale desde la URL
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  const locale = locales.includes(potentialLocale as any)
    ? potentialLocale
    : "pt-BR"; // Fallback al locale por defecto

  // Mensajes estáticos para evitar la dependencia del contexto.
  // Podríamos tener un pequeño objeto de traducciones aquí si fuera necesario.
  const messages = {
    title: "Error 404",
    description: `A página no caminho ${pathname} não existe ou foi movida.`,
    backToHome: "Voltar ao Início",
    goToDashboard: "Ir para o Dashboard",
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-primary" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tighter md:text-6xl">
          {messages.title}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {messages.description}
        </p>
        <div className="mt-10 flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${locale}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {messages.backToHome}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/dashboard`}>
              <Home className="mr-2 h-4 w-4" />
              {messages.goToDashboard}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Internacionalización Ligera: Para traducir esta página, se podría implementar una pequeña lógica que cargue un objeto de mensajes simple (sin usar `next-intl`) basado en el `locale` detectado. Por ejemplo: `const messages = locale === 'es-ES' ? esMessages : ptBRMessages;`. Esto mantendría el componente autónomo.
 * 2. Componente de Error Genérico: Este patrón de "título, descripción, botones de acción" es reutilizable. Se podría crear un componente de UI genérico `<ErrorState />` que reciba estas props para ser usado aquí y en otros lugares donde se manejen errores.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Sugerencias de Rutas Inteligentes: Se podría analizar el `pathname` y compararlo con las rutas válidas (obtenidas de un `routes-manifest.json` generado en el build) usando un algoritmo de similitud de cadenas para sugerir "¿Quizás quisiste decir /features?".
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Detección de Idioma del Navegador: Este componente podría usar `navigator.language` en el cliente para intentar redirigir a la página de inicio con el `locale` más apropiado, en lugar de usar siempre `pt-BR` como fallback.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Detección de Locale más Robusta: La lógica actual para extraer el `locale` del `pathname` es simple. Podría mejorarse para manejar casos más complejos o ser reemplazada si `next-intl` proporciona una forma oficial de acceder al `locale` dentro de `not-found.tsx` en futuras versiones.
 * 2. Carga Selectiva de Mensajes: El hook `useMessages()` carga todos los mensajes. Para optimizar, se podría crear una lógica que extraiga solo el namespace `NotFoundPage` del objeto de mensajes completo y lo pase al proveedor, reduciendo la cantidad de datos que el componente necesita manejar.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Logging de Errores 404: Implementar una `Server Action` que se llame desde un `useEffect` en esta página para registrar las URLs que generan un 404 en una tabla de Supabase. Esto es invaluable para detectar enlaces rotos internos o externos y mejorar el SEO.
 * 2. Sugerencias Inteligentes de Rutas: Para errores 404 en el dominio principal, se podría analizar el `pathname` (ej. `/caracteristicas`) y compararlo con las rutas válidas (obtenidas del `routes-manifest.json`) usando un algoritmo de similitud de cadenas (como la distancia de Levenshtein) para sugerir "¿Quizás quisiste decir /features?".
 * 3. Internacionalización del Contenido: Dado que este componente ahora es la raíz, su contenido está en español. Debería ser modificado para usar `useTranslations` de `next-intl` y mostrar los mensajes en el idioma correspondiente, convirtiéndolo en un componente verdaderamente global.
 */
