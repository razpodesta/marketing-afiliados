// app/s/[subdomain]/page.tsx
/**
 * @file Public Subdomain Page (Server Component)
 * @description Esta página se renderiza públicamente para cada tenant. Carga los datos
 * del tenant desde Supabase y muestra su página de bienvenida.
 *
 * @author Metashark
 * @version 2.0.0 (Data Source Refactor)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// CORRECCIÓN: Apuntar a la nueva función desde `tenants.ts`
import { getTenantDataBySubdomain } from "@/lib/platform/tenants";
import { protocol, rootDomain } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { subdomain: string };
}): Promise<Metadata> {
  const { subdomain } = params;
  // CORRECCIÓN: Llamar a la nueva función
  const tenantData = await getTenantDataBySubdomain(subdomain);

  if (!tenantData) {
    return {
      title: `Subdomain not found | ${rootDomain}`,
    };
  }

  return {
    title: `${tenantData.subdomain}.${rootDomain}`,
    description: `Welcome to the page for ${tenantData.subdomain}`,
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const { subdomain } = params;
  // CORRECCIÓN: Llamar a la nueva función
  const tenantData = await getTenantDataBySubdomain(subdomain);

  if (!tenantData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {rootDomain}
        </Link>
      </div>

      <div className="text-center">
        <div className="mb-6 text-9xl">{tenantData.icon}</div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Welcome to {tenantData.subdomain}.{rootDomain}
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          This is your custom subdomain page.
        </p>
      </div>
    </div>
  );
}
