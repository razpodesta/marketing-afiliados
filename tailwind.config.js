/* Ruta: tailwind.config.js */

const { fontFamily } = require("tailwindcss/defaultTheme");

/**
 * @file Configuración de Tailwind CSS.
 * @description Este archivo define la configuración del tema, plugins y rutas
 * de contenido para Tailwind CSS. Se alinea con las variables CSS definidas en
 * `globals.css` para una identidad de marca consistente.
 *
 * @author Metashark
 * @version 2.0.0 (Brand Identity Alignment)
 */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
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
  plugins: [require("tailwindcss-animate")],
};
/* Ruta: tailwind.config.js */

/* MEJORAS PROPUESTAS
 * 1. **Fuentes de Marca:** Considerar añadir una fuente de exhibición (display font) para los títulos principales (H1, H2) para reforzar la identidad de marca. Se definiría como una variable CSS (`--font-display`) y se añadiría a la configuración de `fontFamily` aquí.
 * 2. **Plugin de Contenedores Fluidos:** Para un diseño más avanzado, investigar `@tailwindcss/container-queries`. Esto permitiría que los componentes se adapten a su contenedor en lugar de a la ventana del navegador, creando UIs más modulares y reutilizables.
 * 3. **Paleta de Colores Extendida:** Generar una paleta de colores más completa (tonos del 50 al 900) para los colores primario y secundario. Herramientas en línea pueden generar estos tonos a partir de un color base, lo que proporciona más flexibilidad en el diseño.
1.  **Tipografía Fina:** Añadir más variables de `fontFamily` (ej. `--font-serif`, `--font-mono`) y mapearlas
 *    aquí para tener un control tipográfico completo y consistente en toda la aplicación.
2.  **Plugin de Tipografía (`@tailwindcss/typography`):** Para páginas con contenido extenso de texto (como
 *    un blog o una sección de documentación), instalar y configurar este plugin oficial proporciona
 *    estilos "prose" por defecto, mejorando enormemente la legibilidad con un esfuerzo mínimo.
3.  **Variables de Espaciado y Tamaño:** Para un sistema de diseño aún más estricto, se podrían definir
 *    variables CSS para espaciados y tamaños en `:root` y mapearlas aquí, de manera similar a como se
 *    ha hecho con los colores y el `borderRadius`.
*/
