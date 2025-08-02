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
 *   interceptada por el `middleware.ts`, que se encarga de la lógica de i18n. Este es el
 *   patrón más robusto y desacoplado.
 * - **Persistencia de Preferencia:** Al cambiar de idioma, establece una cookie (`NEXT_LOCALE_CHOSEN`)
 *   para que el middleware redirija al usuario a su idioma preferido en futuras visitas.
 *
 * @see {@link file://./LanguageSwitcher.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el selector de idioma.
 *
 * 1.  **Sincronización con Perfil de Usuario:** (Vigente) Para usuarios autenticados, la preferencia de idioma podría guardarse en la tabla `profiles` y ser la fuente de verdad principal.
 * 2.  **Traducciones en la Página de Selección:** (Vigente) La página `/choose-language` podría ser refactorizada para usar `getTranslations` y mostrar su contenido en múltiples idiomas.
 * 3.  **Animaciones de Transición:** (Vigente) Añadir animaciones sutiles con `framer-motion` al menú desplegable.
 */
"use client";

import { Globe } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import Cookies from "js-cookie";

import { AppLocale, locales } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

      const newPath = `/${newLocale}${currentPathWithoutLocale}`;
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
// components/ui/LanguageSwitcher.tsx
