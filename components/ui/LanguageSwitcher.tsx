// components/ui/LanguageSwitcher.tsx
"use client";

import Cookies from "js-cookie";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logger } from "@/lib/logging";
import {
  type AppLocale,
  locales,
  usePathname,
  useRouter,
} from "@/lib/navigation";

const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";

/**
 * @exports LanguageSwitcher
 * @description Componente de cliente atómico y reutilizable para cambiar el idioma de la aplicación.
 *              Obtiene el locale actual de los parámetros de la URL, muestra el idioma
 *              activo y permite al usuario seleccionar un nuevo idioma de una lista desplegable.
 *              Al seleccionar un nuevo idioma, actualiza la cookie de preferencia y
 *              refresca la ruta actual con el nuevo prefijo de locale.
 * @returns {React.ReactElement} El componente de selector de idioma.
 */
export function LanguageSwitcher(): React.ReactElement {
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = params.locale as AppLocale;

  const localeDetails: Record<AppLocale, { name: string; flag: string }> =
    locales.reduce(
      (acc, locale) => {
        const keySuffix = locale.replace("-", "_");
        acc[locale] = {
          name: t(`language_${keySuffix}` as any),
          flag: t(`flag_${keySuffix}` as any),
        };
        return acc;
      },
      {} as Record<AppLocale, { name: string; flag: string }>
    );

  const handleLocaleChange = (newLocale: AppLocale): void => {
    logger.trace("[LanguageSwitcher] Inicio de cambio de idioma.", {
      from: currentLocale,
      to: newLocale,
      currentPath: pathname,
    });

    startTransition(() => {
      Cookies.set(COOKIE_NAME, newLocale, { expires: 365, path: "/" });
      router.replace(pathname as any, { locale: newLocale });
    });
  };

  const currentDetails = currentLocale ? localeDetails[currentLocale] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          aria-label={t("selectLanguage_sr")}
        >
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
            "..."
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
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Importación Crítica (TS2551)**: ((Implementada)) Se ha corregido la importación del hook `useParams` para que apunte a `next/navigation`, resolviendo el `TypeError` que causaba un crash en el cliente y rompía la funcionalidad de cambio de idioma.
 *
 * @subsection Melhorias Futuras
 * 1. **Sincronización con Perfil de Usuario**: ((Vigente)) Para usuarios autenticados, la preferencia de idioma podría guardarse en la tabla `profiles`, sincronizando la experiencia a través de dispositivos.
 */
// components/ui/LanguageSwitcher.tsx
