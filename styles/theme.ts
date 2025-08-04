// styles/theme.ts (Nuevo Aparato)
/**
 * @file theme.ts
 * @description Única Fuente de Verdad (SSoT) para el sistema de diseño.
 *              Este objeto define toda la paleta de colores y tokens de diseño.
 *              Es consumido por `tailwind.config.mjs` y por el script que genera
 *              las variables CSS, garantizando una consistencia total.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export const themeConfig = {
  light: {
    background: "0 0% 100%",
    foreground: "222 84% 4%",
    card: "0 0% 100%",
    cardForeground: "222 84% 4%",
    popover: "0 0% 100%",
    popoverForeground: "222 84% 4%",
    primary: "74 80% 45%",
    primaryForeground: "0 0% 100%",
    secondary: "226 90% 96%",
    secondaryForeground: "226 78% 40%",
    muted: "240 4.8% 95.9%",
    mutedForeground: "240 3.8% 46.1%",
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 98%",
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "74 80% 45%",
  },
  dark: {
    background: "224 71% 4%",
    foreground: "210 40% 98%",
    card: "224 71% 8%",
    cardForeground: "210 40% 98%",
    popover: "224 71% 4%",
    popoverForeground: "210 40% 98%",
    primary: "74 92% 56%",
    primaryForeground: "222 84% 4%",
    secondary: "226 78% 58%",
    secondaryForeground: "210 40% 98%",
    muted: "223 47% 11%",
    mutedForeground: "215 20% 65%",
    accent: "223 47% 11%",
    accentForeground: "210 40% 98%",
    destructive: "0 63% 31%",
    destructiveForeground: "210 40% 98%",
    border: "223 47% 15%",
    input: "223 47% 15%",
    ring: "74 92% 56%",
  },
  radius: "0.5rem",
};
