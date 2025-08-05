// next.config.mjs
/**
 * @file Configuración de Next.js
 * @description Este archivo configura las opciones para el framework Next.js.
 *              Ha sido refactorizado para integrar Sentry de forma completa,
 *              incluyendo la subida automática de source maps para una
 *              observabilidad de producción de nivel de élite.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 7.1.0 (Syntax Fix)
 */
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https://avatars.githubusercontent.com"],
  "font-src": ["'self'"],
  "connect-src": [
    "'self'",
    `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("://")[1]}`,
    "https://*.sentry.io",
  ],
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, value]) => `${key} ${value.join(" ")}`)
  .join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\s{2,}/g, " ").trim(),
  },
  // ... (otros headers)
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https", // <-- COMA AÑADIDA
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
};

const finalConfig = withSentryConfig(
  withBundleAnalyzer(withNextIntl(nextConfig)),
  sentryWebpackPluginOptions,
  {
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);

export default finalConfig;
