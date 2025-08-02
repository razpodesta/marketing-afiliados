// components/ui/LanguageSwitcher.tsx
/**
 * @file LanguageSwitcher.tsx
 * @description Componente de cliente para cambiar el idioma de la aplicación.
 *              Establece una cookie de preferencia para persistir la elección del usuario,
 *              mejorando la experiencia en visitas posteriores. Utiliza los hooks de
 *              navegación de `next-intl` para realizar cambios de ruta seguros y tipados.
 * @author RaZ Podestá & L.I.A Legacy
 * @co-author MetaShark
 * @version 3.0.0 (Persistent Language Preference)
 * @see {@link file://./LanguageSwitcher.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el selector de idioma.
 *
 * 1.  **Sincronización con Perfil de Usuario:** (Vigente) Para usuarios autenticados, la preferencia de idioma podría guardarse en la tabla `profiles`. Al iniciar sesión, la cookie `NEXT_LOCALE_CHOSEN` podría ser establecida desde el servidor basándose en esta preferencia.
 * 2.  **Traducciones en la Página de Selección:** (Vigente) La página `/choose-language` podría ser refactorizada para usar `getTranslations` y mostrar su contenido en múltiples idiomas.
 * 3.  **Animaciones de Transición:** (Vigente) Añadir animaciones sutiles con `framer-motion` a la página de selección de idioma para una experiencia de bienvenida más pulida.
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
// components/ui/LanguageSwitcher.tsx
