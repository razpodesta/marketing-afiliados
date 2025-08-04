// components/ui/LanguageSwitcher.tsx
/**
 * @file LanguageSwitcher.tsx
 * @description Componente de cliente para cambiar el idioma de la aplicación.
 *              Ha sido refactorizado para utilizar el router nativo de Next.js,
 *              garantizando un cambio de idioma robusto al delegar la lógica de
 *              internacionalización al middleware, que es su única fuente de verdad.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.1.0 (Native Navigation for Robust Locale Switching)
 *
 * @functionality
 * - **Renderizado Contextual:** Lee el `locale` actual de la URL a través del hook `useParams`.
 * - **Navegación Nativa:** Al seleccionar un nuevo idioma, construye la nueva ruta completa
 *   y utiliza el `router.replace` de `next/navigation`. Esto fuerza una navegación que es
 *   interceptada por el `middleware.ts`, que se encarga de la lógica de i18n.
 * - **Persistencia de Preferencia:** Al cambiar de idioma, establece una cookie (`NEXT_LOCALE_CHOSEN`)
 *   para que el middleware redirija al usuario a su idioma preferido en futuras visitas.
 */
"use client";

import { Globe } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AppLocale, locales } from "@/lib/navigation";

const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";
const localeDetails: Record<AppLocale, { name: string; flag: string }> = {
  "en-US": { name: "English", flag: "🇺🇸" },
  "es-ES": { name: "Español", flag: "🇪🇸" },
  "pt-BR": { name: "Português", flag: "🇧🇷" },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocaleParam = Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale;
  const currentLocale = locales.find(
    (loc: AppLocale) => loc === currentLocaleParam
  );

  const handleLocaleChange = (newLocale: AppLocale) => {
    Cookies.set(COOKIE_NAME, newLocale, { expires: 365, path: "/" });

    startTransition(() => {
      const currentPathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
        ? pathname.substring(`/${currentLocale}`.length)
        : pathname;

      const newPath = `/${newLocale}${currentPathWithoutLocale || "/"}`;
      router.replace(newPath);
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
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Sincronización con Perfil de Usuario**: ((Vigente)) Para usuarios autenticados, la preferencia de idioma podría guardarse en la tabla `profiles` y ser la fuente de verdad principal, sobreescribiendo la cookie.
 * 2. **Animaciones de Transición**: ((Vigente)) Añadir animaciones sutiles con `framer-motion` al menú desplegable para una experiencia de usuario más pulida.
 *
 * @subsection Mejoras Implementadas
 * 1. **Navegación Nativa Robusta**: ((Implementada)) Se ha refactorizado el componente para usar `next/navigation`, delegando la lógica de i18n al `middleware`, lo que resulta en un sistema más simple y robusto.
 */
// components/ui/LanguageSwitcher.tsx
