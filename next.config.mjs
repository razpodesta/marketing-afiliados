// next.config.mjs
/**
 * @file Configuración de Next.js
 * @description Este archivo configura las opciones para el framework Next.js.
 * CORREGIDO: Se ha convertido a módulo ES para compatibilidad con next-intl.
 *
 * @author Metashark
 * @version 4.1.0 (ES Module Configuration)
 */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  // Proporciona la ruta a tu archivo de configuración de i18n.
  "./i18n.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * @description Personalización avanzada de la configuración de Webpack.
   * @param {object} config - El objeto de configuración de Webpack existente.
   * @param {object} options - Opciones de la compilación, como `isServer`.
   * @returns {object} El objeto de configuración de Webpack modificado.
   */
  webpack: (config, { isServer }) => {
    // CORRECCIÓN: Resuelve el error de compilación con la librería 'jose'.
    if (isServer) {
      config.externals = [...config.externals, "jose"];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
/* MEJORAS FUTURAS DETECTADAS
 * 1. Análisis de Bundle con `@next/bundle-analyzer`: Para optimizar el rendimiento en producción, se podría integrar `@next/bundle-analyzer`. Se configura envolviendo la `nextConfig` con el analizador, lo que genera un informe visual interactivo de los tamaños de los paquetes de JavaScript. Esto es invaluable para identificar dependencias pesadas y oportunidades de optimización, como la carga dinámica de componentes.
 * 2. Configuración de Dominios de Imágenes Remotas: Es una práctica de seguridad y rendimiento crucial configurar explícitamente los dominios de los que la aplicación puede cargar imágenes a través de `next/image`. Dado que la aplicación utiliza avatares de proveedores de OAuth, se debería añadir sus dominios (ej. `lh3.googleusercontent.com` para Google) a la sección `images.remotePatterns` para prevenir la carga de imágenes desde fuentes no autorizadas.
 * 3. Cabeceras de Seguridad (Security Headers): Se puede utilizar la clave `headers` en la configuración de Next.js para añadir cabeceras de seguridad HTTP a todas las respuestas, como `Content-Security-Policy` (CSP), `X-Content-Type-Options`, `Strict-Transport-Security` y `X-Frame-Options`. Esto endurece significativamente la seguridad de la aplicación contra ataques comunes como XSS y clickjacking.
 */
/* MEJORAS PROPUESTAS
 * 1. **Análisis de Bundle:** Para optimizar el rendimiento a futuro, se podría integrar `@next/bundle-analyzer`. Se configura envolviendo `nextConfig` con el analizador, lo que genera un informe visual de los tamaños de los paquetes de JavaScript, ayudando a identificar oportunidades de optimización.
 * 2. **Configuración de Imágenes:** Es una buena práctica de seguridad y rendimiento configurar explícitamente los dominios de los que se pueden cargar imágenes. Si se van a usar avatares de proveedores de OAuth (como Google), se debería añadir su dominio (ej. `lh3.googleusercontent.com`) a la sección `images.remotePatterns`.
 * 3. **Variables de Entorno de Build:** Para configuraciones más complejas, se pueden usar variables de entorno durante la compilación (`NEXT_PUBLIC_...`) para habilitar o deshabilitar características (como el analizador de bundle) dinámicamente según el entorno (desarrollo, staging, producción).

 * 1. **Externalizar Otras Dependencias Nativas:** Si en el futuro se añaden otras librerías que dependen fuertemente de APIs de Node.js (como `bcrypt` nativo en lugar de `bcryptjs`), también deberían añadirse a este array para prevenir problemas similares. Por ejemplo: `serverComponentsExternalPackages: ["jose", "bcrypt"]`.
 * 2. **Configuración de Imágenes:** Descomentar y configurar la sección `images` para permitir explícitamente dominios remotos desde los cuales se cargarán imágenes (por ejemplo, avatares de usuarios de proveedores OAuth). Esto es una mejor práctica de seguridad.
 * 3. **Análisis de Bundle:** Para optimizar el rendimiento a futuro, se podría integrar `@next/bundle-analyzer` para visualizar qué dependencias ocupan más espacio en los bundles de producción y tomar decisiones informadas sobre la optimización (por ejemplo, mediante carga dinámica de componentes).
 */
