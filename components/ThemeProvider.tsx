/* Ruta: components/ThemeProvider.tsx */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
// CORRECCIÓN: Con la librería actualizada, los tipos se exportan desde el
// punto de entrada principal, no desde una ruta interna 'dist/types'.
// Esta corrección resuelve el error de compilación de TypeScript.
import { type ThemeProviderProps } from "next-themes";

/**
 * @file ThemeProvider.tsx
 * @description Proveedor de contexto para la gestión de temas (claro/oscuro).
 * Este componente encapsula `next-themes` para proporcionar la funcionalidad
 * de cambio de tema a toda la aplicación. Se ha corregido la importación
 * de tipos para alinearla con las versiones modernas de la librería.
 *
 * @author Metashark
 * @version 2.1.0 (Corrected Type Import)
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
/* Ruta: components/ThemeProvider.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Crear un Hook de Tema Personalizado:** Abstraer el uso de `useTheme` en un hook personalizado, como `useBrandTheme`. Esto permitiría añadir lógica de negocio futura (ej. analíticas en el cambio de tema, lógica específica de la marca) en un solo lugar sin tener que refactorizar cada componente que use el tema.
 * 2. **Persistencia en Base de Datos:** Para usuarios autenticados, se podría extender la funcionalidad para guardar la preferencia de tema en la tabla `profiles` de Supabase. El `ThemeProvider` podría leer esta preferencia al cargar la sesión, sincronizando la experiencia a través de diferentes dispositivos.
 * 3. **Tema por Defecto del Sistema Forzado:** Para el primer renderizado, en lugar de `defaultTheme="system"`, se podría detectar el tema del sistema en el servidor (usando cabeceras `Sec-CH-Prefers-Color-Scheme`) para evitar cualquier parpadeo (flash) de cambio de tema en la carga inicial.
 */
/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Auditoría de Dependencias:** Es una buena práctica realizar auditorías periódicas de las dependencias
 *    del proyecto (usando `pnpm audit` y `pnpm outdated`) para mantener los paquetes actualizados,
 *    recibir parches de seguridad y beneficiarse de las últimas mejoras de rendimiento y API.
2.  **Forzar Tema en Rutas Específicas:** Utilizar la prop `forcedTheme` para aplicar un tema
 *    específico en ciertas páginas, como una página de previsualización de landings.
1.  **Actualización de Dependencias:** Considerar actualizar `next-themes` a la última versión para
 *    aprovechar las últimas características y una API de tipos más limpia.
1.  **Forzar Tema en Rutas Específicas:** Se puede usar esta configuración para forzar un
 *    tema específico en ciertas partes de la aplicación si fuera necesario,
 *    pasando la prop `forcedTheme` (ej. para una página de previsualización de landings).
2.  **Transición Suave de Tema:** Aunque hemos deshabilitado las transiciones de CSS por defecto (`disableTransitionOnChange`)
 *    para evitar parpadeos, se podrían implementar animaciones de transición de color más suaves
 *    y personalizadas en `globals.css` para una experiencia de cambio de tema más pulida.
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Forzar Tema en Rutas Específicas:** Se puede usar esta configuración para forzar un
 *    tema específico en ciertas partes de la aplicación si fuera necesario,
 *    pasando la prop `forcedTheme`.
*/
