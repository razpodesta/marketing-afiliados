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
/* MEJORAS FUTURAS DETECTADAS
 * 1. Persistir Preferencia de Idioma: Al cambiar de idioma, se podría guardar la preferencia del usuario en una cookie. El `middleware` de `next-intl` puede ser configurado para leer esta cookie en visitas posteriores y redirigir automáticamente al usuario a su idioma preferido, en lugar de depender únicamente de la detección del navegador. Esto mejora la consistencia de la experiencia para usuarios recurrentes.
 * 2. Accesibilidad de los Emojis: Los emojis de banderas son visuales, pero no accesibles para lectores de pantalla. Se podría mejorar la accesibilidad envolviendo el emoji en un `<span>` con `role="img"` y un `aria-label` que describa la bandera, por ejemplo: `<span role="img" aria-label="Bandera de Estados Unidos">🇺🇸</span>`.
 * 3. Extracción de Tipos de `locale`: Para una seguridad de tipos aún mayor en toda la aplicación, el tipo para los `locales` soportados (`"en-US" | "es-ES" | "pt-BR"`) podría definirse una sola vez en `navigation.ts` y ser exportado para ser utilizado aquí y en otros lugares donde se maneje el `locale`, evitando la necesidad de inferirlo del array.
 */
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
