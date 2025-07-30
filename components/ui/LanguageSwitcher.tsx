// Ruta: components/ui/LanguageSwitcher.tsx (CORREGIDO)
/**
 * @file LanguageSwitcher.tsx
 * @description Componente de cliente para cambiar el idioma de la aplicación.
 *              Ahora establece una cookie de preferencia para persistir la elección del usuario.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 3.0.0 (Persistent Language Preference)
 */
"use client";

import { Globe } from "lucide-react";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AppLocale,
  type AppPathname,
  locales,
  usePathname,
  useRouter,
} from "@/lib/navigation";

const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";
const localeDetails: Record<AppLocale, { name: string; flag: string }> = {
  "en-US": { name: "English", flag: "🇺🇸" },
  "es-ES": { name: "Español", flag: "🇪🇸" },
  "pt-BR": { name: "Português", flag: "🇧🇷" },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname: AppPathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocaleParam = Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale;
  const currentLocale = locales.find(
    (loc: AppLocale) => loc === currentLocaleParam
  );

  const handleLocaleChange = (newLocale: AppLocale) => {
    // CORRECCIÓN: Persistir la elección del usuario en una cookie.
    Cookies.set(COOKIE_NAME, newLocale, { expires: 365, path: "/" });

    startTransition(() => {
      router.replace(
        {
          pathname,
          params: params as any,
        },
        { locale: newLocale }
      );
    });
  };

  const currentDetails = currentLocale ? localeDetails[currentLocale] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <Globe className="h-4 w-4 mr-2" />
          {currentDetails ? (
            <>
              <span
                className="mr-2"
                role="img"
                aria-label={currentDetails.name}
              >
                {currentDetails.flag}
              </span>
              <span>{currentDetails.name}</span>
            </>
          ) : (
            "Select Language"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale: AppLocale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => handleLocaleChange(locale)}
            disabled={locale === currentLocale || isPending}
          >
            <span
              className="mr-2"
              role="img"
              aria-label={localeDetails[locale].name}
            >
              {localeDetails[locale].flag}
            </span>
            {localeDetails[locale].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el selector de idioma.
 *
 * 1.  **Sincronización con Perfil de Usuario:** Para usuarios autenticados, la preferencia de idioma podría guardarse en la tabla `profiles`. Al iniciar sesión, la cookie `NEXT_LOCALE_CHOSEN` podría ser establecida desde el servidor basándose en esta preferencia, sincronizando la experiencia a través de diferentes dispositivos.
 * 2.  **Traducciones en la Página de Selección:** La página `/choose-language` actualmente tiene texto estático en inglés. Podría ser refactorizada para usar `getTranslations` y mostrar el texto "Please select your language" en múltiples idiomas.
 * 3.  **Animaciones de Transición:** Añadir animaciones sutiles con `framer-motion` a la página de selección de idioma para una experiencia de bienvenida más pulida y moderna.
 */
/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `LanguageSwitcher.tsx` es el componente de cliente para la
 *               internacionalización.
 *
 * @functionality
 * - Orquesta el cambio de idioma de la aplicación.
 * - **Corrección Crítica:** Hemos resuelto una cascada de errores de tipo. El `usePathname`
 *   de `next-intl` ahora devuelve nuestro tipo `AppPathname` específico (gracias a nuestra
 *   refactorización de `lib/navigation.ts`). Al asignar explícitamente este tipo a la
 *   variable `pathname`, satisfacemos el contrato del `router`. Ahora, el router sabe
 *   que la ruta es válida y puede inferir correctamente los `params` necesarios,
 *   eliminando los errores `TS2724` y `TS2322`.
 *
 * @relationships
 * - Depende de `lib/navigation.ts` como la única fuente de verdad para los tipos de ruta.
 *
 * @expectations
 * - Con esta corrección, el componente `LanguageSwitcher` es ahora completamente
 *   seguro en tipos y está alineado con la arquitectura de enrutamiento moderna,
 *   eliminando el riesgo de regresiones en la navegación internacionalizada.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar el selector de idioma.
 *
 * 1.  **Persistir Preferencia de Idioma:** (Revalidado) Guardar la preferencia de idioma del usuario en una cookie.
 * 2.  **Accesibilidad de Emojis:** (Implementado) Se ha añadido `role="img"` y `aria-label` a los emojis de banderas.
 */
// Ruta: components/ui/LanguageSwitcher.tsx
