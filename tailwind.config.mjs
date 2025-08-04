// tailwind.config.mjs (Refactorizado)
/**
 * @file tailwind.config.mjs
 * @description Configuración de Tailwind CSS. Ahora consume la Única Fuente de Verdad
 *              desde `styles/theme.ts` para una consistencia garantizada.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Single Source of Truth)
 */
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import { themeConfig } from "./styles/theme.ts";

function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

function generateTailwindColors(theme) {
  const colors = {};
  for (const key in theme) {
    if (key.endsWith("Foreground")) continue;
    const foregroundKey = `${key}Foreground`;
    colors[toKebabCase(key)] = {
      DEFAULT: `hsl(var(--${toKebabCase(key)}))`,
      foreground: `hsl(var(--${toKebabCase(foregroundKey)}))`,
    };
  }
  return colors;
}

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        ...generateTailwindColors(themeConfig.dark),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
