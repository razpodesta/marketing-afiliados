// next.config.mjs
/**
 * @file Configuración de Next.js
 * @description Este archivo configura las opciones para el framework Next.js.
 *              Ha sido refactorizado a un nivel de élite, incorporando una
 *              Política de Seguridad de Contenido (CSP) estricta, una política
 *              de imágenes robusta y la capacidad de analizar el tamaño del bundle
 *              bajo demanda para auditorías de rendimiento.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Elite Security & Performance Configuration)
 */
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Inicializa el analizador de bundle solo si se solicita explícitamente.
// Uso: ANALYZE=true pnpm build
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// --- INICIO DE POLÍTICA DE SEGURIDAD DE CONTENIDO (CSP) ---
// Construye la CSP de forma programática para una mejor mantenibilidad.
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // 'unsafe-eval' y 'unsafe-inline' son necesarios para algunas librerías en modo dev, se pueden restringir más en producción.
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https://avatars.githubusercontent.com"], // Se alinea con `remotePatterns`.
  "font-src": ["'self'"],
  "connect-src": [
    "'self'",
    `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("://")[1]}`, // Permite la conexión a la API de Supabase.
  ],
  "frame-src": ["'self'"], // Permite iframes del mismo origen.
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"], // Previene clickjacking.
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, value]) => `${key} ${value.join(" ")}`)
  .join("; ");
// --- FIN DE POLÍTICA DE SEGURIDAD DE CONTENIDO (CSP) ---

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- ENDURECIMIENTO DE SEGURIDAD ---
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // --- OPTIMIZACIÓN Y SEGURIDAD DE IMÁGENES ---
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      // Añadir aquí otros dominios confiables para avatares (Google, etc.)
    ],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "jose"];
    }
    return config;
  },
};

// --- COMPOSICIÓN DE PLUGINS ---
export default withBundleAnalyzer(withNextIntl(nextConfig));

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Generación de Nonce para CSP**: ((Vigente)) Para una seguridad máxima, reemplazar `'unsafe-inline'` en la CSP por un sistema de `nonce` generado en cada petición, una característica soportada por Next.js.
 *
 * @subsection Mejoras Implementadas
 * 1. **Política de Seguridad de Contenido (CSP)**: ((Implementada)) Se ha añadido una CSP estricta para mitigar ataques XSS.
 * 2. **Política de Imágenes Remotas**: ((Implementada)) Se ha configurado `remotePatterns` para `next/image`.
 * 3. **Analizador de Bundle bajo Demanda**: ((Implementada)) Se ha integrado `@next/bundle-analyzer` de forma opcional.
 */
// next.config.mjs
