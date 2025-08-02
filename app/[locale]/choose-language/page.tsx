// app/[locale]/choose-language/page.tsx
/**
 * @file page.tsx
 * @description Página de fallback para que los visitantes seleccionen su idioma
 *              cuando no puede ser determinado automáticamente. Ha sido refactorizada
 *              para cumplir con los nuevos requisitos de temporizador y idioma por defecto.
 * @author L.I.A Legacy
 * @version 2.0.0 (Intelligent Fallback Alignment)
 * @see {@link file://./page.test.tsx} Para el arnés de pruebas correspondiente.
 */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Separator } from "@/components/ui/separator";

const languages = [
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
];
// CORRECCIÓN: Ajustado a los nuevos requisitos.
const DEFAULT_LOCALE = "es-ES";
const REDIRECT_TIMEOUT_SECONDS = 15;
const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";

export default function ChooseLanguagePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_TIMEOUT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      handleLanguageSelect(DEFAULT_LOCALE);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]); // Se añade router a las dependencias por completitud.

  /**
   * @function handleLanguageSelect
   * @description Establece la cookie de preferencia de idioma y redirige al usuario.
   * @param {string} locale - El código del idioma seleccionado.
   */
  const handleLanguageSelect = (locale: string) => {
    Cookies.set(COOKIE_NAME, locale, { expires: 365, path: "/" });
    router.replace(`/${locale}`);
  };

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
        <h1 className="mt-4 text-3xl font-bold">Welcome to Metashark</h1>
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
          {/* REFACTORIZACIÓN: Se añade el LanguageSwitcher para permitir cambio si el idioma detectado es incorrecto */}
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
 * @description Mejoras para evolucionar la página de selección de idioma.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Traducción del Contenido de la Página**: (Vigente) El texto de esta página ("Please Select Your Language") está codificado en inglés. Debería ser internacionalizado para que se muestre en el idioma que el middleware detectó en el navegador, proporcionando una experiencia más nativa incluso en esta página de fallback.
 * 2. **Detección de País como Sugerencia**: (Vigente) Podríamos leer la información de geolocalización de Vercel en el `middleware` y pasarla como un parámetro de búsqueda a esta página. La página podría entonces resaltar visualmente el idioma sugerido basado en el país del usuario (ej. un borde de color primario en el botón de Español si el país es 'CL').
 * 3. **Animación de la Cuenta Regresiva**: (Vigente) Añadir una animación sutil a la cuenta regresiva (ej. un pulso o un cambio de color a medida que se acerca a cero) para llamar la atención del usuario sobre la redirección automática inminente.
 */
// app/[locale]/choose-language/page.tsx
