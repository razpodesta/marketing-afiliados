// Ruta: components/ui/LanguageSwitcher.tsx

"use client";

import { usePathname, useRouter } from "@/navigation";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // CORREGIDO: Importación correcta
import { locales } from "@/navigation";

/**
 * @file LanguageSwitcher.tsx
 * @description Componente de cliente para cambiar el idioma.
 * CORREGIDO: Se ha solucionado el error de importación y se ha añadido
 * una guarda de tipo para manejar el `locale` de forma segura.
 *
 * @author Metashark
 * @version 1.1.0 (Type Safety & Import Fix)
 */

const localeDetails: Record<string, { name: string; flag: string }> = {
  "en-US": { name: "English", flag: "🇺🇸" },
  "es-ES": { name: "Español", flag: "🇪🇸" },
  "pt-BR": { name: "Português", flag: "🇧🇷" },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // CORRECCIÓN: Guarda de tipo para asegurar que `currentLocale` es válido.
  const currentLocaleParam = Array.isArray(params.locale)
    ? params.locale[0]
    : params.locale;
  const currentLocale = locales.find((loc) => loc === currentLocaleParam);

  const handleLocaleChange = (newLocale: (typeof locales)[number]) => {
    // `newLocale` ya tiene el tipo correcto gracias al array `locales`.
    router.replace(pathname, { locale: newLocale });
  };

  const currentDetails = currentLocale ? localeDetails[currentLocale] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {currentDetails ? (
            <>
              <span className="mr-2">{currentDetails.flag}</span>
              <span>{currentDetails.name}</span>
            </>
          ) : (
            "Select Language"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => handleLocaleChange(locale)}
            disabled={locale === currentLocale}
          >
            <span className="mr-2">{localeDetails[locale].flag}</span>
            {localeDetails[locale].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Guardar Preferencia de Idioma:** Guardar la preferencia del usuario en una cookie o `localStorage`.
2.  **Accesibilidad (A11y):** Añadir `aria-label` a los emojis de las banderas.
3.  **Extracción de Tipos:** Para un tipado más robusto, el tipo `Locale` se puede definir una vez en `i18n.ts` y ser importado en toda la aplicación para asegurar consistencia.
1.  **Guardar Preferencia de Idioma:** Al cambiar de idioma, se podría guardar la preferencia del
 *    usuario en una cookie (`next-intl` tiene soporte para esto) o en el `localStorage`, para
 *    que su próxima visita sea directamente en el idioma seleccionado.
2.  **Accesibilidad (A11y):** Añadir `aria-label` a los emojis de las banderas para que los lectores
 *    de pantalla los anuncien correctamente (ej. `aria-label="Bandera de España"`).
*/
