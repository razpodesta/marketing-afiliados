// app/[locale]/choose-language/page.tsx
/**
 * @file page.tsx
 * @description Página de fallback para que los visitantes seleccionen su idioma.
 *              Ha sido refactorizada a una arquitectura atómica, delegando su
 *              lógica de temporizador al hook especializado `useCountdownRedirect`.
 *              Ahora, este componente es una capa de presentación pura, más simple,
 *              robusta y inherentemente testable.
 * @author L.I.A Legacy
 * @version 3.0.0 (Atomic Architecture)
 * @see {@link file://../../../lib/hooks/useCountdownRedirect.ts} Para la lógica de negocio.
 * @see {@link file://../../../tests/app/[locale]/choose-language/page.test.tsx} Para el arnés de pruebas correspondiente.
 */
"use client";

import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Separator } from "@/components/ui/separator";
import { useCountdownRedirect } from "@/lib/hooks/useCountdownRedirect";

const languages = [
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
];

const DEFAULT_LOCALE = "es-ES";
const REDIRECT_TIMEOUT_SECONDS = 15;
const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";

export default function ChooseLanguagePage() {
  const router = useRouter();

  /**
   * @function handleLanguageSelect
   * @description Callback memoizado que encapsula la lógica de selección de idioma.
   *              Establece la cookie de preferencia y redirige al usuario.
   * @param {string} locale - El código del idioma seleccionado.
   */
  const handleLanguageSelect = useCallback(
    (locale: string) => {
      Cookies.set(COOKIE_NAME, locale, { expires: 365, path: "/" });
      router.replace(`/${locale}`);
    },
    [router]
  );

  /**
   * @description Hook que gestiona la cuenta regresiva.
   *              Cuando el contador llega a cero, invoca `handleLanguageSelect`
   *              con el idioma por defecto.
   */
  const { countdown } = useCountdownRedirect(REDIRECT_TIMEOUT_SECONDS, () =>
    handleLanguageSelect(DEFAULT_LOCALE)
  );

  // Formatea el contador para mostrarlo siempre con dos dígitos.
  const seconds = countdown.toString().padStart(2, "0");

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, hsl(var(--primary)/0.05), transparent 40%)",
        }}
      />
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt="Logo de MetaShark"
          width={64}
          height={64}
          priority
        />
      </div>
      <Card className="w-full max-w-lg border-border/60 bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-center">
            Please Select Your Language
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="h-auto w-40 flex-col gap-2 p-4"
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <span className="text-5xl">{lang.flag}</span>
                <span className="font-semibold">{lang.name}</span>
              </Button>
            ))}
          </div>
          <Separator />
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              O selecciona de la lista completa:
            </p>
            <LanguageSwitcher />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Redirigiendo al idioma por defecto en 00:{seconds}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Traducción del Contenido de la Página**: ((Vigente)) El texto de esta página ("Please Select Your Language") está codificado en inglés. Debería ser internacionalizado para que se muestre en el idioma que el middleware detectó en el navegador.
 * 2. **Detección de País como Sugerencia**: ((Vigente)) Se podría pasar la información de geolocalización de Vercel como un parámetro de búsqueda a esta página para resaltar visualmente el idioma sugerido.
 *
 * @subsection Mejoras Implementadas
 * 1. **Arquitectura Atómica**: ((Implementada)) Toda la lógica compleja del temporizador ha sido extraída al hook reutilizable `useCountdownRedirect`, haciendo este componente significativamente más simple, declarativo y fácil de mantener.
 * 2. **Optimización de `useCallback`**: ((Implementada)) La función `handleLanguageSelect` está ahora memoizada, mejorando la estabilidad del componente.
 */
// app/[locale]/choose-language/page.tsx
