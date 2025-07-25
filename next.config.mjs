// next.config.mjs
/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  // Proporciona la ruta a tu archivo de configuración de i18n.
  "./i18n.ts"
);

const nextConfig = {
  // Aquí puedes añadir otras opciones de configuración de Next.js si las necesitas.
  // Por ejemplo:
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'example.com',
  //     },
  //   ],
  // },
};

export default withNextIntl(nextConfig);
