// Ruta: app/[locale]/choose-language/page.tsx (NUEVO APARATO)
/**
 * @file page.tsx
 * @description Página intersticial para que los nuevos visitantes seleccionen su idioma.
 *              Esta página establece una cookie de preferencia y redirige al usuario.
 *              Incluye un temporizador de cuenta regresiva para una redirección automática
 *              al idioma por defecto.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Se necesitaría una librería ligera como 'js-cookie' para un manejo robusto de cookies en el cliente.
// Se puede instalar con `pnpm add js-cookie @types/js-cookie`
import Cookies from "js-cookie";

const languages = [
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
];
const DEFAULT_LOCALE = "pt-BR";
const COOKIE_NAME = "NEXT_LOCALE_CHOSEN";
const REDIRECT_TIMEOUT_SECONDS = 120; // 2 minutos

export default function ChooseLanguagePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_TIMEOUT_SECONDS);

  // Lógica del temporizador de cuenta regresiva
  useEffect(() => {
    if (countdown <= 0) {
      handleLanguageSelect(DEFAULT_LOCALE);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    // Limpieza del temporizador al desmontar el componente
    return () => clearTimeout(timer);
  }, [countdown]);

  /**
   * @function handleLanguageSelect
   * @description Establece la cookie de preferencia de idioma y redirige al usuario.
   * @param {string} locale - El código del idioma seleccionado.
   */
  const handleLanguageSelect = (locale: string) => {
    Cookies.set(COOKIE_NAME, locale, { expires: 365, path: "/" });
    router.replace(`/${locale}`);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = (countdown % 60).toString().padStart(2, "0");

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
        <CardContent className="flex flex-col items-center">
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
          <p className="text-sm text-muted-foreground mt-8 text-center">
            Redirecting to default language in {minutes}:{seconds}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
