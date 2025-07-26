/* Ruta: lib/supabase/auth-theme.ts */

import { type Theme } from "@supabase/auth-ui-shared";

/**
 * @file auth-theme.ts
 * @description Define un tema de marca personalizado para el componente `@supabase/auth-ui-react`.
 * Este archivo centraliza la apariencia del formulario de autenticación para que coincida
 * con la identidad visual de Metashark, utilizando las variables CSS globales de la aplicación.
 * Este enfoque promueve la mantenibilidad y la coherencia del diseño.
 *
 * @author Metashark
 * @version 1.0.0
 */
export const brandTheme: Theme = {
  default: {
    colors: {
      brand: "hsl(var(--primary))",
      brandAccent: "hsl(var(--primary) / 0.8)",
      brandButtonText: "hsl(var(--primary-foreground))",
      defaultButtonBackground: "hsl(var(--card))",
      defaultButtonBackgroundHover: "hsl(var(--muted))",
      defaultButtonBorder: "hsl(var(--border))",
      defaultButtonText: "hsl(var(--foreground))",
      dividerBackground: "hsl(var(--border))",
      inputBackground: "hsl(var(--input))",
      inputBorder: "hsl(var(--border))",
      inputBorderHover: "hsl(var(--ring))",
      inputBorderFocus: "hsl(var(--ring))",
      inputText: "hsl(var(--foreground))",
      inputLabelText: "hsl(var(--muted-foreground))",
      inputPlaceholder: "hsl(var(--muted-foreground) / 0.6)",
      messageText: "hsl(var(--foreground))",
      messageTextDanger: "hsl(var(--destructive))",
      anchorTextColor: "hsl(var(--muted-foreground))",
      anchorTextHoverColor: "hsl(var(--primary))",
    },
    space: {
      spaceSmall: "4px",
      spaceMedium: "8px",
      spaceLarge: "16px",
      labelBottomMargin: "8px",
      anchorBottomMargin: "4px",
      emailInputSpacing: "8px",
      socialAuthSpacing: "8px",
      buttonPadding: "10px 15px",
      inputPadding: "10px 15px",
    },
    fontSizes: {
      baseBodySize: "14px",
      baseInputSize: "14px",
      baseLabelSize: "14px",
      baseButtonSize: "14px",
    },
    fonts: {
      bodyFontFamily: `var(--font-geist-sans), sans-serif`,
      buttonFontFamily: `var(--font-geist-sans), sans-serif`,
      inputFontFamily: `var(--font-geist-sans), sans-serif`,
      labelFontFamily: `var(--font-geist-sans), sans-serif`,
    },
    radii: {
      borderRadiusButton: "var(--radius)",
      buttonBorderRadius: "var(--radius)",
      inputBorderRadius: "var(--radius)",
    },
  },
};
/* Ruta: lib/supabase/auth-theme.ts */

/* MEJORAS PROPUESTAS
 * 1. **Exportar Constantes de Color HSL:** En lugar de repetir las cadenas `hsl(var(--...))`, se podrían definir como constantes en `globals.css` o en un archivo de tema de Tailwind y exportarlas desde un archivo de configuración para ser reutilizadas aquí y en otros componentes JS que necesiten acceso a los colores del tema.
 * 2. **Variantes de Tema:** Se podría expandir este archivo para exportar múltiples temas (ej. `minimalTheme`, `lightBrandTheme`) que podrían ser aplicados dinámicamente al componente de autenticación según el contexto (ej. un tema más simple para un modal de login).
 * 3. **Integración con `next-themes`:** Desarrollar una lógica que detecte el tema activo (`light` o `dark`) a través del hook `useTheme` y pase una versión del `brandTheme` adaptada al tema claro, haciendo que el formulario de Supabase cambie de apariencia junto con el resto de la aplicación.
 */
